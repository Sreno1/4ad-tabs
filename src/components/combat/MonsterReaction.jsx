import React, { memo } from 'react';

const MonsterReaction = memo(function MonsterReaction({ monster }) {
  const getReactionStyle = (reaction) => {
    if (reaction.hostile === true) {
      return 'bg-red-900/50 text-red-300';
    }
    if (reaction.hostile === false) {
      return 'bg-green-900/50 text-green-300';
    }
    return 'bg-yellow-900/50 text-yellow-300';
  };

  if (!monster.reaction) return null;

  return (
    <div className="flex items-center mt-1 text-xs">
      <div className={`flex-1 px-1 py-0.5 rounded ${getReactionStyle(monster.reaction)}`}>
        <span className="font-bold">{monster.reaction.name}</span>
        <span className="ml-1 text-slate-400">(rolled {monster.reaction.roll})</span>
      </div>
    </div>
  );
});

export default MonsterReaction;
