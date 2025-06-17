export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to WorkFlowPro</h1>
      <p className="text-xl text-gray-600 mb-8">
        Streamline your tasks and boost team collaboration
      </p>
      <div className="flex gap-4">
        <a
          href="/login"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Login
        </a>
        <a
          href="/register"
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
        >
          Register
        </a>
      </div>
    </main>
  );
}
