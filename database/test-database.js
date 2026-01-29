import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://xlubjwiumytdkxrzojdg.supabase.co'
const supabaseKey = 'sb_publishable_tJhxDaNVJNXg66Z1sxzqKQ_e9XLGbCX'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...')
    
    try {
        // Test if we can access the users table
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1)
        
        if (error) {
            console.log('❌ Database access error:', error.message)
            return false
        } else {
            console.log('✅ Database connection successful!')
            return true
        }
    } catch (err) {
        console.log('❌ Connection error:', err.message)
        return false
    }
}

async function testRegistration() {
    console.log('\n🧪 Testing registration flow...')
    
    try {
        // Test auth signup
        const testEmail = `test${Date.now()}@example.com`
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: testEmail,
            password: '123456'
        })
        
        if (authError) {
            console.log('❌ Auth signup error:', authError.message)
            return false
        }
        
        console.log('✅ Auth signup successful!')
        
        // Test profile creation
        if (authData.user) {
            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .insert([{
                    id: authData.user.id,
                    name: 'Test User',
                    email: testEmail,
                    phone: '09123456789',
                    user_type: 'patient'
                }])
                .select()
            
            if (profileError) {
                console.log('❌ Profile creation error:', profileError.message)
                return false
            } else {
                console.log('✅ Profile creation successful!')
                return true
            }
        }
        
        return false
    } catch (err) {
        console.log('❌ Registration test error:', err.message)
        return false
    }
}

async function main() {
    console.log('🚀 DELAS ALAS DENTAL CLINIC - DATABASE TEST')
    console.log('=' * 50)
    
    const connectionOk = await testDatabaseConnection()
    
    if (connectionOk) {
        const registrationOk = await testRegistration()
        
        console.log('\n📊 TEST RESULTS:')
        console.log('=' * 30)
        console.log(`Database Connection: ${connectionOk ? '✅ PASS' : '❌ FAIL'}`)
        console.log(`Registration Flow: ${registrationOk ? '✅ PASS' : '❌ FAIL'}`)
        
        if (connectionOk && registrationOk) {
            console.log('\n🎉 ALL TESTS PASSED!')
            console.log('✅ Your database is ready for registration!')
            console.log('✅ You can now test the registration form!')
        } else {
            console.log('\n⚠️  SOME TESTS FAILED')
            console.log('❌ You may need to run the SQL script manually')
            console.log('📝 Copy the SQL from: database/FIX_REGISTRATION_COMPLETE.sql')
        }
    } else {
        console.log('\n❌ DATABASE CONNECTION FAILED')
        console.log('🔧 Please check your Supabase configuration')
    }
}

// Run the test
main().catch(console.error)

