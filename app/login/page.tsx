import { login, signup } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  // 1. Update the type to be a Promise
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  // 2. Await the searchParams before using them
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <form className="flex w-full max-w-md flex-col gap-4 p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center">Second Brain Login</h1>
        
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs p-3 rounded-lg leading-relaxed">
          <p className="font-semibold mb-1">Demo Access Credentials:</p>
          <p>Email: <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">atharva@gmail.com</code></p>
          <p>Password: <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">pass@321</code></p>
          <p className="mt-2 text-gray-500 italic">Please make sure to add this user once in your Supabase Auth dashboard if not already created.</p>
        </div>

        <label className="text-sm font-medium" htmlFor="email">Email</label>
        <input 
          id="email" 
          name="email" 
          type="email" 
          required 
          defaultValue="atharva@gmail.com"
          className="border p-2 rounded" 
          placeholder="you@example.com"
        />

        <label className="text-sm font-medium" htmlFor="password">Password</label>
        <input 
          id="password" 
          name="password" 
          type="password" 
          required 
          defaultValue="pass@321"
          // Supabase requires min 6 chars by default
          minLength={6}
          className="border p-2 rounded" 
          placeholder="••••••••"
        />

        <div className="flex gap-2 mt-4">
          <button formAction={login} className="bg-black text-white p-2 rounded flex-1">
            Log in
          </button>
          
          {/* This IS your registration button. Clicking this adds the user to Supabase Auth DB */}
          <button formAction={signup} className="border border-black p-2 rounded flex-1">
            Sign up
          </button>
        </div>

        {params?.message && (
          <p className="mt-4 p-4 bg-blue-100 text-blue-900 text-center rounded">
            {params.message}
          </p>
        )}
        {params?.error && (
          <p className="mt-4 p-4 bg-red-100 text-red-900 text-center rounded">
            {params.error}
          </p>
        )}
      </form>
    </div>
  )
}