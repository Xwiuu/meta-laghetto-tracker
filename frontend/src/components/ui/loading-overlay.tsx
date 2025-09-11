'use client';

import { useLoading } from '@/context/LoadingContext';

// Este é um componente simples de spinner animado com Tailwind CSS
const Spinner = () => (
  <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
);

export const LoadingOverlay = () => {
  const { isLoading } = useLoading();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-black/80">
      <Spinner />
      <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">A carregar dados...</p>
    </div>
  );
};