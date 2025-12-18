import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getUserByGithubId(githubId: string) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('github_id', githubId)
        .single()

    if (error) throw error
    return data
}

export async function getUserById(userId: string) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) throw error
    return data
}

export async function updateUserStats(userId: string, stats: any) {
    const { error } = await supabase
        .from('users')
        .update(stats)
        .eq('id', userId)

    if (error) throw error
}
