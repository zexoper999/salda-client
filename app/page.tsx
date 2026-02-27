export default async function Home() {
  const response = await fetch("http://localhost:8080/", { cache: "no-store" });
  const data = await response.json();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          SALDA 프로젝트
        </h1>

        <div className="mt-8 p-4 bg-blue-50 text-blue-800 font-semibold rounded-lg">
          {data.message}
        </div>
      </div>
    </main>
  );
}
