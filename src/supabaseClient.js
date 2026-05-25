import { createClient } from '@supabase/supabase-js';
import { INITIAL_ATHLETES, INITIAL_LIBRARY } from './data/constants.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const useRealSupabase = 
  supabaseUrl && 
  typeof supabaseUrl === 'string' &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) &&
  supabaseAnonKey && 
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

class MockSupabaseQuery {
  constructor(table) {
    this.table = table;
    const localData = localStorage.getItem(`db_${table}`);
    this.data = localData ? JSON.parse(localData) : [];

    // Pre-populate with realistic mock records if database is empty or outdated
    if (this.data.length === 0 || (table === 'track_library_drills' && this.data.length < 100)) {
      if (table === 'track_athletes' || table === 'agilitylap_athletes') {
        this.data = INITIAL_ATHLETES.map(a => ({
          id: a.id,
          name: a.name,
          birth_year: a.birthYear,
          weight: a.weight,
          height: a.height,
          body_fat: a.bodyFat,
          vertical_jump: a.verticalJump,
          standing_long_jump: a.standingLongJump,
          squat_jump: a.squatJump,
          clean: a.clean,
          half_squat: a.halfSquat,
          quarter_squat: a.quarterSquat,
          full_squat: a.fullSquat,
          bench: a.bench,
          deadlift: a.deadlift,
          created_at: new Date().toISOString()
        }));
        localStorage.setItem(`db_${table}`, JSON.stringify(this.data));
      } else if (table === 'track_library_drills') {
        this.data = INITIAL_LIBRARY.drills.map(d => ({
          ...d,
          created_at: new Date().toISOString()
        }));
        localStorage.setItem(`db_${table}`, JSON.stringify(this.data));
      } else if (table === 'track_week_templates') {
        this.data = INITIAL_LIBRARY.templates.map(t => ({
          id: t.id,
          template_name: t.title,
          template_type: t.type,
          drills: t.drills,
          created_at: new Date().toISOString()
        }));
        localStorage.setItem(`db_${table}`, JSON.stringify(this.data));
      }
    }

    this.currentFilter = () => true;
    this.currentSort = null;
    this.operation = null; // Holds pending operations like insert, update, upsert, delete
  }

  select(fields) {
    // Chainable select
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.currentSort = (a, b) => {
      let valA = a[column];
      let valB = b[column];
      if (column === 'created_at') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      }
      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    };
    return this;
  }

  eq(column, value) {
    const prevFilter = this.currentFilter;
    this.currentFilter = (item) => prevFilter(item) && String(item[column]) === String(value);
    return this;
  }

  gte(column, value) {
    const prevFilter = this.currentFilter;
    this.currentFilter = (item) => prevFilter(item) && item[column] >= value;
    return this;
  }

  lte(column, value) {
    const prevFilter = this.currentFilter;
    this.currentFilter = (item) => prevFilter(item) && item[column] <= value;
    return this;
  }

  save() {
    localStorage.setItem(`db_${this.table}`, JSON.stringify(this.data));
  }

  insert(record) {
    this.operation = {
      type: 'insert',
      records: Array.isArray(record) ? record : [record]
    };
    return this;
  }

  update(updates) {
    this.operation = {
      type: 'update',
      updates
    };
    return this;
  }

  upsert(record, options = {}) {
    this.operation = {
      type: 'upsert',
      records: Array.isArray(record) ? record : [record],
      onConflict: options.onConflict
    };
    return this;
  }

  delete() {
    this.operation = {
      type: 'delete'
    };
    return this;
  }

  // Promise-compatible thenable interface to execute lazily
  then(onfulfilled, onrejected) {
    let resultData = [];
    
    if (this.operation) {
      const op = this.operation;
      
      if (op.type === 'insert') {
        const inserted = op.records.map(r => ({
          id: r.id || `id-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          created_at: new Date().toISOString(),
          ...r
        }));
        this.data.push(...inserted);
        this.save();
        resultData = inserted;
        
      } else if (op.type === 'update') {
        let updatedItems = [];
        this.data = this.data.map(item => {
          if (this.currentFilter(item)) {
            const newItem = { ...item, ...op.updates };
            updatedItems.push(newItem);
            return newItem;
          }
          return item;
        });
        this.save();
        resultData = updatedItems;
        
      } else if (op.type === 'upsert') {
        const insertedOrUpdated = [];
        op.records.forEach(r => {
          const conflictKeys = op.onConflict ? op.onConflict.split(',') : [];
          let index = -1;
          if (conflictKeys.length > 0) {
            index = this.data.findIndex(item => {
              return conflictKeys.every(k => String(item[k]) === String(r[k]));
            });
          } else {
            index = this.data.findIndex(item => String(item.id) === String(r.id));
          }

          const updatedRecord = { ...r };
          if (!updatedRecord.id) {
            updatedRecord.id = `id-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
          }
          if (!updatedRecord.created_at) {
            updatedRecord.created_at = new Date().toISOString();
          }

          if (index !== -1) {
            this.data[index] = { ...this.data[index], ...updatedRecord };
            insertedOrUpdated.push(this.data[index]);
          } else {
            this.data.push(updatedRecord);
            insertedOrUpdated.push(updatedRecord);
          }
        });
        this.save();
        resultData = insertedOrUpdated;
        
      } else if (op.type === 'delete') {
        let deletedItems = [];
        this.data = this.data.filter(item => {
          if (this.currentFilter(item)) {
            deletedItems.push(item);
            return false;
          }
          return true;
        });
        this.save();
        resultData = deletedItems;
      }
    } else {
      // Standard Select Query
      let filtered = this.data.filter(this.currentFilter);
      if (this.currentSort) {
        filtered.sort(this.currentSort);
      }
      resultData = filtered;
    }

    return Promise.resolve({ data: resultData, error: null }).then(onfulfilled, onrejected);
  }
}

const mockSupabase = {
  from(table) {
    return new MockSupabaseQuery(table);
  }
};

export const supabase = useRealSupabase ? createClient(supabaseUrl, supabaseAnonKey) : mockSupabase;
export const isRealSupabase = !!useRealSupabase;
