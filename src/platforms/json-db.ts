import { promises as fs } from 'fs';
import { join } from 'path';

// Store database in data/db.json
const DB_PATH = join(process.cwd(), 'data', 'db.json');

export type Primitive = string | number | boolean | undefined | null;

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

interface Database {
  photos: any[];
  albums?: any[];
  [key: string]: any;
}

let dbCache: Database | null = null;

// Ensure data directory and database file exist
const ensureDb = async (): Promise<Database> => {
  if (dbCache) {
    return dbCache;
  }

  const dataDir = join(process.cwd(), 'data');
  
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }

  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    dbCache = JSON.parse(data);
    return dbCache!;
  } catch {
    // Create empty database
    dbCache = { photos: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(dbCache, null, 2));
    return dbCache;
  }
};

const saveDb = async (db: Database) => {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
  dbCache = db;
};

// Simple query parser for basic SQL operations
export const query = async <T = any>(
  queryString: string,
  values: Primitive[] = [],
): Promise<QueryResult<T>> => {
  const db = await ensureDb();
  
  // Handle CREATE TABLE
  if (/CREATE TABLE/i.test(queryString)) {
    const tableName = queryString.match(/CREATE TABLE[^(]+(\w+)/i)?.[1];
    if (tableName && !db[tableName]) {
      db[tableName] = [];
      await saveDb(db);
    }
    return { rows: [], rowCount: 0 };
  }

  // Handle INSERT
  if (/INSERT INTO/i.test(queryString)) {
    const tableName = queryString.match(/INSERT INTO\s+(\w+)/i)?.[1];
    if (!tableName) {
      throw new Error('Invalid INSERT query');
    }

    // Extract column names
    const columnsMatch = queryString.match(/\(([^)]+)\)/);
    if (!columnsMatch) {
      throw new Error('Invalid INSERT query - no columns');
    }
    
    const columns = columnsMatch[1].split(',').map(c => c.trim());
    
    // Create object from values
    const row: any = {};
    columns.forEach((col, idx) => {
      row[col] = values[idx];
    });

    if (!db[tableName]) {
      db[tableName] = [];
    }
    
    db[tableName].push(row);
    await saveDb(db);
    
    return { rows: [row] as T[], rowCount: 1 };
  }

  // Handle SELECT
  if (/SELECT/i.test(queryString)) {
    const tableName = queryString.match(/FROM\s+(\w+)/i)?.[1];
    
    // Handle COUNT(*) special case - always return a row with count
    if (/COUNT\s*\(\s*\*\s*\)/i.test(queryString)) {
      if (!tableName || !db[tableName]) {
        return { rows: [{ count: '0' }] as T[], rowCount: 1 };
      }
      
      let results = db[tableName];
      
      // Handle WHERE for COUNT
      if (/WHERE/i.test(queryString)) {
        const whereClause = queryString.match(/WHERE\s+(.+?)(?:ORDER BY|LIMIT|GROUP BY|$)/i)?.[1];
        if (whereClause) {
          const eqMatch = whereClause.match(/(\w+)\s*=\s*\$(\d+)/);
          if (eqMatch) {
            const [, column, valueIdx] = eqMatch;
            const value = values[parseInt(valueIdx) - 1];
            results = results.filter((row: any) => row[column] === value);
          }
        }
      }
      
      // Get aggregate values (MIN, MAX)
      const countRow: any = { count: results.length.toString() };
      
      if (/MIN\s*\(\s*[\w.]+\s*\)/i.test(queryString)) {
        const minMatch = queryString.match(/MIN\s*\(\s*([\w.]+)\s*\)\s*as\s+(\w+)/i);
        if (minMatch && results.length > 0) {
          const [, field, alias] = minMatch;
          const fieldName = field.split('.').pop() || field;
          countRow[alias] = results.reduce((min: any, row: any) => 
            !min || row[fieldName] < min ? row[fieldName] : min, null);
        }
      }
      
      if (/MAX\s*\(\s*[\w.]+\s*\)/i.test(queryString)) {
        const maxMatch = queryString.match(/MAX\s*\(\s*([\w.]+)\s*\)\s*as\s+(\w+)/i);
        if (maxMatch && results.length > 0) {
          const [, field, alias] = maxMatch;
          const fieldName = field.split('.').pop() || field;
          countRow[alias] = results.reduce((max: any, row: any) => 
            !max || row[fieldName] > max ? row[fieldName] : max, null);
        }
      }
      
      return { rows: [countRow] as T[], rowCount: 1 };
    }
    
    if (!tableName || !db[tableName]) {
      return { rows: [], rowCount: 0 };
    }

    let results = db[tableName];

    // Handle WHERE clauses (very basic)
    if (/WHERE/i.test(queryString)) {
      const whereClause = queryString.match(/WHERE\s+(.+?)(?:ORDER BY|LIMIT|$)/i)?.[1];
      if (whereClause) {
        // Simple equality check
        const eqMatch = whereClause.match(/(\w+)\s*=\s*\$(\d+)/);
        if (eqMatch) {
          const [, column, valueIdx] = eqMatch;
          const value = values[parseInt(valueIdx) - 1];
          results = results.filter((row: any) => row[column] === value);
        }
      }
    }

    // Handle ORDER BY
    if (/ORDER BY/i.test(queryString)) {
      const orderMatch = queryString.match(/ORDER BY\s+(\w+)\s+(ASC|DESC)?/i);
      if (orderMatch) {
        const [, column, direction] = orderMatch;
        results = [...results].sort((a: any, b: any) => {
          const aVal = a[column];
          const bVal = b[column];
          const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          return direction?.toUpperCase() === 'DESC' ? -comparison : comparison;
        });
      }
    }

    // Handle LIMIT
    if (/LIMIT/i.test(queryString)) {
      const limitMatch = queryString.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        const limit = parseInt(limitMatch[1]);
        results = results.slice(0, limit);
      }
    }

    return { rows: results as T[], rowCount: results.length };
  }

  // Handle UPDATE
  if (/UPDATE/i.test(queryString)) {
    const tableName = queryString.match(/UPDATE\s+(\w+)/i)?.[1];
    if (!tableName || !db[tableName]) {
      return { rows: [], rowCount: 0 };
    }

    // Very basic UPDATE support
    let updated = 0;
    // This is simplified - in production would need proper SQL parsing
    
    return { rows: [], rowCount: updated };
  }

  // Handle DELETE
  if (/DELETE/i.test(queryString)) {
    const tableName = queryString.match(/FROM\s+(\w+)/i)?.[1];
    if (!tableName || !db[tableName]) {
      return { rows: [], rowCount: 0 };
    }

    const beforeCount = db[tableName].length;
    
    // Handle WHERE clause
    if (/WHERE/i.test(queryString)) {
      const whereClause = queryString.match(/WHERE\s+(.+?)$/i)?.[1];
      if (whereClause) {
        const eqMatch = whereClause.match(/(\w+)\s*=\s*\$(\d+)/);
        if (eqMatch) {
          const [, column, valueIdx] = eqMatch;
          const value = values[parseInt(valueIdx) - 1];
          db[tableName] = db[tableName].filter((row: any) => row[column] !== value);
        }
      }
    } else {
      // DELETE all
      db[tableName] = [];
    }

    const deleted = beforeCount - db[tableName].length;
    await saveDb(db);
    
    return { rows: [], rowCount: deleted };
  }

  // Default: return empty result
  return { rows: [], rowCount: 0 };
};

// Template literal SQL function compatible with Postgres version
export const sql = <T = any>(
  strings: TemplateStringsArray,
  ...values: Primitive[]
): Promise<QueryResult<T>> => {
  if (!isTemplateStringsArray(strings) || !Array.isArray(values)) {
    throw new Error('Invalid template literal argument');
  }

  let result = strings[0] ?? '';

  for (let i = 1; i < strings.length; i++) {
    result += `$${i}${strings[i] ?? ''}`;
  }

  return query<T>(result, values);
};

const isTemplateStringsArray = (
  strings: unknown,
): strings is TemplateStringsArray => {
  return (
    Array.isArray(strings) && 'raw' in strings && Array.isArray(strings.raw)
  );
};

export const testDatabaseConnection = async () => {
  try {
    await ensureDb();
    return { rows: [{ count: '1' }], rowCount: 1 };
  } catch (error) {
    throw new Error(`Database connection failed: ${error}`);
  }
};
