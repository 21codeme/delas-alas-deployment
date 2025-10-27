// Local Supabase Implementation
// This is a complete implementation that doesn't rely on external CDN

class LocalSupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.auth = new LocalSupabaseAuth(this);
    }
    
    from(table) {
        return new LocalSupabaseQuery(this, table);
    }
    
    channel(name) {
        return new LocalSupabaseChannel(this, name);
    }
}

class LocalSupabaseAuth {
    constructor(client) {
        this.client = client;
    }
    
    async signUp({ email, password, options = {} }) {
        try {
            const response = await fetch(`${this.client.url}/auth/v1/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.client.key,
                    'Authorization': `Bearer ${this.client.key}`
                },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    data: options.data || {} 
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { data: null, error: { message: data.msg || 'Signup failed' } };
            }
            
            return { data, error: null };
        } catch (error) {
            return { data: null, error: { message: error.message } };
        }
    }
    
    async signInWithPassword({ email, password }) {
        try {
            const response = await fetch(`${this.client.url}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.client.key,
                    'Authorization': `Bearer ${this.client.key}`
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { data: null, error: { message: data.msg || 'Login failed' } };
            }
            
            return { 
                data: {
                    user: { 
                        id: data.user?.id || 'temp-user-id', 
                        email: email, 
                        user_metadata: data.user?.user_metadata || {} 
                    },
                    session: data
                }, 
                error: null 
            };
        } catch (error) {
            return { data: null, error: { message: error.message } };
        }
    }
    
    async signOut() {
        try {
            const response = await fetch(`${this.client.url}/auth/v1/logout`, {
                method: 'POST',
                headers: {
                    'apikey': this.client.key,
                    'Authorization': `Bearer ${this.client.key}`
                }
            });
            
            return { error: null };
        } catch (error) {
            return { error: { message: error.message } };
        }
    }
    
    async getUser() {
        try {
            const response = await fetch(`${this.client.url}/auth/v1/user`, {
                headers: {
                    'apikey': this.client.key,
                    'Authorization': `Bearer ${this.client.key}`
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { data: { user: null }, error: { message: data.msg || 'Failed to get user' } };
            }
            
            return { data, error: null };
        } catch (error) {
            return { data: { user: null }, error: { message: error.message } };
        }
    }
    
    async resend({ email }) {
        try {
            const response = await fetch(`${this.client.url}/auth/v1/resend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.client.key,
                    'Authorization': `Bearer ${this.client.key}`
                },
                body: JSON.stringify({
                    email,
                    type: 'signup'
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { error: { message: data.msg || 'Failed to resend email' } };
            }
            
            return { error: null };
        } catch (error) {
            return { error: { message: error.message } };
        }
    }
}

class LocalSupabaseQuery {
    constructor(client, table) {
        this.client = client;
        this.table = table;
        this.query = '';
        this.filters = [];
        this.orderBy = null;
        this.limitCount = null;
        this.isSingle = false;
    }
    
    select(columns = '*') {
        this.query = columns;
        return this;
    }
    
    eq(column, value) {
        this.filters.push(`${column}=eq.${encodeURIComponent(value)}`);
        return this;
    }
    
    order(column, options = {}) {
        const direction = options.ascending ? 'asc' : 'desc';
        this.orderBy = `${column}.${direction}`;
        return this;
    }
    
    limit(count) {
        this.limitCount = count;
        return this;
    }
    
    single() {
        this.isSingle = true;
        this.limitCount = 1;
        return this;
    }
    
    insert(data) {
        return {
            select: () => ({
                single: async () => {
                    try {
                        const url = this._buildUrl();
                        console.log('Inserting data to:', url);
                        
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'apikey': this.client.key,
                                'Authorization': `Bearer ${this.client.key}`,
                                'Prefer': 'return=representation'
                            },
                            body: JSON.stringify(data)
                        });
                        
                        const result = await response.json();
                        console.log('Insert result:', result);
                        
                        if (!response.ok) {
                            return { data: null, error: { message: result.message || 'Insert failed' } };
                        }
                        
                        return Array.isArray(result) && result.length > 0 
                            ? { data: result[0], error: null }
                            : { data: result, error: null };
                    } catch (error) {
                        console.error('Insert error:', error);
                        return { data: null, error: { message: error.message } };
                    }
                }
            }),
            then: async (resolve) => {
                try {
                    const url = this._buildUrl();
                    console.log('Inserting data to:', url);
                    
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': this.client.key,
                            'Authorization': `Bearer ${this.client.key}`,
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    console.log('Insert result:', result);
                    
                    resolve(response.ok ? { data: result, error: null } : { data: null, error: { message: result.message || 'Insert failed' } });
                } catch (error) {
                    console.error('Insert error:', error);
                    resolve({ data: null, error: { message: error.message } });
                }
            }
        };
    }
    
    _buildUrl() {
        let url = `${this.client.url}/rest/v1/${this.table}`;
        const params = [];
        
        if (this.query) {
            params.push(`select=${this.query}`);
        }
        
        if (this.filters.length > 0) {
            params.push(...this.filters);
        }
        
        if (this.orderBy) {
            params.push(`order=${this.orderBy}`);
        }
        
        if (this.limitCount) {
            params.push(`limit=${this.limitCount}`);
        }
        
        if (params.length > 0) {
            url += `?${params.join('&')}`;
        }
        
        return url;
    }
    
    async _executeGet() {
        try {
            const url = this._buildUrl();
            console.log('Executing query:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': this.client.key,
                    'Authorization': `Bearer ${this.client.key}`
                }
            });
            
            const result = await response.json();
            console.log('Query result:', result);
            
            if (!response.ok) {
                return { data: null, error: { message: result.message || 'Query failed' } };
            }
            
            // Handle single() case
            if (this.isSingle) {
                if (Array.isArray(result) && result.length > 0) {
                    return { data: result[0], error: null };
                } else {
                    return { data: null, error: { code: 'PGRST116', message: 'No rows found' } };
                }
            }
            
            return { data: result, error: null };
        } catch (error) {
            console.error('Query error:', error);
            return { data: null, error: { message: error.message } };
        }
    }
    
    // Make it thenable for async/await
    async then(resolve, reject) {
        try {
            const result = await this._executeGet();
            if (resolve) resolve(result);
            return result;
        } catch (error) {
            if (reject) reject(error);
            throw error;
        }
    }
}

class LocalSupabaseChannel {
    constructor(client, name) {
        this.client = client;
        this.name = name;
    }
    
    on(event, callback) {
        console.log(`Channel ${this.name} listening for ${event}`);
        return this;
    }
    
    subscribe(callback) {
        console.log(`Subscribed to channel ${this.name}`);
        return this;
    }
}

// Create the createClient function
function createClient(url, key) {
    return new LocalSupabaseClient(url, key);
}

// Make it globally available
window.createClient = createClient;
window.supabase = {
    createClient: createClient
};

console.log('✅ Local Supabase client loaded');
