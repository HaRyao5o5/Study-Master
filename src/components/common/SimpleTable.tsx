// src/components/common/SimpleTable.tsx
import React from 'react';

interface SimpleTableProps {
  headers?: string[];
  data: Record<string, any>[];
}

const SimpleTable: React.FC<SimpleTableProps> = ({ headers, data }) => {
  if (!data || data.length === 0) return null;
  
  // headersプロップがあればそれを使い、なければデータからキーを抽出するハイブリッド仕様
  const displayHeaders = headers || Object.keys(data[0]);

  return (
    <div className="overflow-x-auto my-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm text-left">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {displayHeaders.map((h, i) => (
              <th key={i} className="px-4 py-2 font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap border-r border-gray-200 dark:border-gray-600 last:border-r-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
              {displayHeaders.map((h, j) => (
                <td key={j} className="px-4 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                  {row[h]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SimpleTable;
