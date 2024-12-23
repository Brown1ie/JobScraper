import React from 'react';
import { Briefcase } from 'lucide-react';
import { QueryClient, QueryClientProvider } from 'react-query';
import SearchForm from './components/SearchForm';
import JobResults from './components/JobResults';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Job Scanner</h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <SearchForm />
          </div>
          <JobResults />
        </main>
      </div>
    </QueryClientProvider>
  );
}