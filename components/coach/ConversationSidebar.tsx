'use client';

interface ConversationSummary {
  id: number;
  title: string | null;
  updatedAt: string;
}

export default function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
}: {
  conversations: ConversationSummary[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
}) {
  return (
    <aside className="space-y-2">
      <button type="button" onClick={onNew} className="btn-secondary w-full text-sm">
        New chat
      </button>

      {conversations.length === 0 ? (
        <p className="px-1 text-xs text-gray-500">No past chats yet.</p>
      ) : (
        <ul className="space-y-1">
          {conversations.map((c) => {
            const active = c.id === activeId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  aria-current={active ? 'true' : undefined}
                  className={[
                    'w-full truncate rounded-lg px-3 py-2 text-left text-sm',
                    active
                      ? 'bg-emerald-600/10 font-semibold text-emerald-700 dark:text-emerald-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                  ].join(' ')}
                >
                  {c.title || 'Untitled chat'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
