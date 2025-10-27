// Execute Messages Setup Script
// This script will run the MESSAGES_SETUP.sql file against the Supabase database

const SUPABASE_URL = 'https://xlubjwiumytdkxrzojdg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdWJqd2l1bXl0ZGt4cnpvamRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTQ2MDAsImV4cCI6MjA3NjI5MDYwMH0.RYal1H6Ibre86bHyMIAmc65WCLt1x0j9p_hbEWdBXnQ';

const fs = require('fs');
const path = require('path');

async function executeMessagesSetup() {
    try {
        console.log('🔄 Executing Messages Setup...');
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'MESSAGES_SETUP.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📄 SQL Content loaded:', sqlContent.length, 'characters');
        
        // Split SQL into individual statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log('📝 Found', statements.length, 'SQL statements');
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`);
                
                try {
                    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                        method: 'POST',
                        headers: {
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            sql: statement + ';'
                        })
                    });
                    
                    if (response.ok) {
                        console.log(`✅ Statement ${i + 1} executed successfully`);
                    } else {
                        const errorText = await response.text();
                        console.log(`⚠️ Statement ${i + 1} warning:`, response.status, errorText);
                    }
                } catch (error) {
                    console.log(`❌ Statement ${i + 1} error:`, error.message);
                }
            }
        }
        
        console.log('✅ Messages setup completed!');
        
        // Test the tables
        console.log('🧪 Testing tables...');
        
        // Test conversations table
        const convResponse = await fetch(`${SUPABASE_URL}/rest/v1/conversations?select=count`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        
        if (convResponse.ok) {
            console.log('✅ Conversations table is accessible');
        } else {
            console.log('❌ Conversations table not accessible:', convResponse.status);
        }
        
        // Test messages table
        const msgResponse = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=count`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        
        if (msgResponse.ok) {
            console.log('✅ Messages table is accessible');
        } else {
            console.log('❌ Messages table not accessible:', msgResponse.status);
        }
        
    } catch (error) {
        console.error('❌ Error executing messages setup:', error);
    }
}

// Run the setup
executeMessagesSetup();


// This script will run the MESSAGES_SETUP.sql file against the Supabase database

const SUPABASE_URL = 'https://xlubjwiumytdkxrzojdg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdWJqd2l1bXl0ZGt4cnpvamRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTQ2MDAsImV4cCI6MjA3NjI5MDYwMH0.RYal1H6Ibre86bHyMIAmc65WCLt1x0j9p_hbEWdBXnQ';

const fs = require('fs');
const path = require('path');

async function executeMessagesSetup() {
    try {
        console.log('🔄 Executing Messages Setup...');
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'MESSAGES_SETUP.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📄 SQL Content loaded:', sqlContent.length, 'characters');
        
        // Split SQL into individual statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log('📝 Found', statements.length, 'SQL statements');
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`);
                
                try {
                    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                        method: 'POST',
                        headers: {
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            sql: statement + ';'
                        })
                    });
                    
                    if (response.ok) {
                        console.log(`✅ Statement ${i + 1} executed successfully`);
                    } else {
                        const errorText = await response.text();
                        console.log(`⚠️ Statement ${i + 1} warning:`, response.status, errorText);
                    }
                } catch (error) {
                    console.log(`❌ Statement ${i + 1} error:`, error.message);
                }
            }
        }
        
        console.log('✅ Messages setup completed!');
        
        // Test the tables
        console.log('🧪 Testing tables...');
        
        // Test conversations table
        const convResponse = await fetch(`${SUPABASE_URL}/rest/v1/conversations?select=count`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        
        if (convResponse.ok) {
            console.log('✅ Conversations table is accessible');
        } else {
            console.log('❌ Conversations table not accessible:', convResponse.status);
        }
        
        // Test messages table
        const msgResponse = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=count`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        
        if (msgResponse.ok) {
            console.log('✅ Messages table is accessible');
        } else {
            console.log('❌ Messages table not accessible:', msgResponse.status);
        }
        
    } catch (error) {
        console.error('❌ Error executing messages setup:', error);
    }
}

// Run the setup
executeMessagesSetup();



























