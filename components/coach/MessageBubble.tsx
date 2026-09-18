'use client';

export default function MessageBubble({
  role,
  content,
}: {
  role: 'user' | 'assistant';
  content: string;
}) {
  const isUser = role === 'user';
  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={[
          'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm',
          isUser
            ? 'bg-emerald-600 text-white'
            : 'bg-cream-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
        ].join(' ')}
      >
        {content}
      </div>
    </div>
  );
}
