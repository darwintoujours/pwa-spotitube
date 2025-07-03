import React, { useState } from 'react';

type SearchBarProps = {
  onSearch: (query: string) => void;
};

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
      <input
        type="text"
        placeholder="Rechercher un titre, artiste ou album"
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{
          flex: 1,
          padding: 12,
          borderRadius: 24,
          border: '1px solid #ccc',
          fontSize: 16,
        }}
      />
      <button
        type="submit"
        style={{
          background: '#1DB954',
          color: '#fff',
          border: 'none',
          borderRadius: 24,
          padding: '0 24px',
          fontWeight: 600,
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        Rechercher
      </button>
    </form>
  );
}
