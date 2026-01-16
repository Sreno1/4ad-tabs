import React, { memo } from 'react';

const MonsterReaction = memo(function MonsterReaction({ monster, onRollReaction }) {
  const getReactionStyle = (reaction) => {
    if (reaction.hostile === true) {
      return 'bg-red-900/50 text-red-300';
    }
    if (reaction.hostile === false) {
      return 'bg-green-900/50 text-green-300';
    }
    return 'bg-yellow-900/50 text-yellow-300';
  };

  return (
    <div className="flex justify-between items-center mt-1 text-xs">
      {monster.reaction ? (
        <div className={`flex-1 px-1 py-0.5 rounded ${getReactionStyle(monster.reaction)}`}>
          <span className="font-bold">{monster.reaction.name}</span>
          <span className="ml-1 text-slate-400">(rolled {monster.reaction.roll})</span>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRollReaction();
          }}
          className="bg-blue-600 hover:bg-blue-500 px-2 py-0.5 rounded text-white"
        >
          Roll Reaction
        </button>
      )}
    </div>
  );
});

export default MonsterReaction;
