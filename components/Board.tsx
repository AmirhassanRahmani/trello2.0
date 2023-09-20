"use client";
import { useBoardStore } from "@/store/BoardStore";
import { useEffect } from "react";
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import Column from "./Column";

function Board() {
  const [board, getBoard, setBoardState, updateTodoInDB] = useBoardStore(
    (state) => [
      state.board,
      state.getBoard,
      state.setBoardState,
      state.updateTodoInDB,
    ]
  );

  useEffect(() => {
    getBoard();
  }, [getBoard]);

  const handleOnDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    // check if the user dragged card outside of board
    if (!destination) return;

    // Handle column drag
    if (type === "column") {
      const entries = Array.from(board.columns.entries());
      const [remove] = entries.splice(source.index, 1);
      entries.splice(destination.index, 0, remove);
      const rearrangedColumns = new Map(entries);
      setBoardState({
        ...board,
        columns: rearrangedColumns,
      });
    }

    const columns = Array.from(board.columns);

    const startColIndex = columns[Number(source.droppableId)]; // all inProgress info

    const finishColIndex = columns[Number(destination.droppableId)]; // all done info

    const startCol: Column = {
      // key and value of inProgress
      id: startColIndex[0],
      todos: startColIndex[1].todos,
    };

    const finishCol: Column = {
      // key and value of the done
      id: finishColIndex[0],
      todos: finishColIndex[1].todos,
    };

    if (!startCol || !finishCol) return;

    if (startCol === finishCol && source.index === destination.index) return;

    const newTodos = startCol.todos; // all todos of inProgress

    const [todoMoved] = newTodos.splice(source.index, 1); // remove the selected todo in inProgress

    if (startCol.id === finishCol.id) {
      // same column task drag
      newTodos.splice(destination.index, 0, todoMoved);

      const newCol = {
        id: startCol.id,
        todos: newTodos,
      };

      const newColumns = new Map(board.columns);

      newColumns.set(startCol.id, newCol);

      setBoardState({ ...board, columns: newColumns });
    } else {
      // dragging to another column
      const finishTodos = Array.from(finishCol.todos);

      finishTodos.splice(destination.index, 0, todoMoved);

      const newColumns = new Map(board.columns);

      const newCol = {
        id: startCol.id,
        todos: newTodos,
      };

      newColumns.set(startCol.id, newCol);

      newColumns.set(finishCol.id, {
        id: finishCol.id,
        todos: finishTodos,
      });

      // update in db just for cross todos transmit
      updateTodoInDB(todoMoved, finishCol.id);

      setBoardState({ ...board, columns: newColumns });
    }
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="board" direction="horizontal" type="column">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto"
          >
            {Array.from(board.columns.entries()).map(([id, column], index) => (
              <Column key={id} id={id} todos={column.todos} index={index} />
            ))}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default Board;
