// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faTimes, faSave } from '@fortawesome/free-solid-svg-icons';

gsap.registerPlugin(ScrollTrigger);

function ToDoApp() {
  const [spaces, setSpaces] = useState([]);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newTodos, setNewTodos] = useState({});
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const appRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    console.log(localStorage.getItem('useLocalStorage'));
    const storedUseLocalStorage = JSON.parse(localStorage.getItem('useLocalStorage'));
    setUseLocalStorage(storedUseLocalStorage !== null ? storedUseLocalStorage : false);

    if (storedUseLocalStorage) {
      const storedSpaces = JSON.parse(localStorage.getItem('spaces')) || [];
      setSpaces(storedSpaces);
      setNewTodos(storedSpaces.reduce((acc, space) => ({ ...acc, [space.id]: '' }), {}));
    }

    gsap.to(appRef.current, { opacity: 1, duration: 1, ease: 'power2.out' });

    const cursor = cursorRef.current;
    document.addEventListener('mousemove', (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.2,
        ease: 'power2.out',
      });
    });

    ScrollTrigger.batch('.space', {
      onEnter: (elements) => {
        gsap.from(elements, {
          opacity: 0,
          y: 30,
          stagger: 0.15,
          duration: 0.6,
          ease: 'power3.out',
        });
      },
      once: true,
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('useLocalStorage', JSON.stringify(useLocalStorage));
    if (useLocalStorage) {
      localStorage.setItem('spaces', JSON.stringify(spaces));
    }
  }, [useLocalStorage, spaces]);

  const toggleLocalStorage = () => {
    setUseLocalStorage(!useLocalStorage);
    gsap.to('#localStorageToggle', {
      x: useLocalStorage ? 0 : 20,
      duration: 0.3,
      ease: 'power2.inOut',
    });
  };

  const addSpace = () => {
    if (newSpaceName.trim()) {
      const newSpace = { id: uuidv4(), name: newSpaceName, todos: [] };
      setSpaces([...spaces, newSpace]);
      setNewSpaceName('');
      setNewTodos({ ...newTodos, [newSpace.id]: '' });
      
      gsap.from(`#space-${newSpace.id}`, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: 'power3.out',
        onComplete: () => ScrollTrigger.refresh(),
      });
    }
  };

  const handleSpaceKeyPress = (e) => {
    if (e.key === 'Enter') {
      addSpace();
    }
  };

  const addTodo = (spaceId) => {
    if (newTodos[spaceId].trim()) {
      const updatedSpaces = spaces.map(space => 
        space.id === spaceId 
          ? { ...space, todos: [...space.todos, { id: uuidv4(), text: newTodos[spaceId], completed: false }] }
          : space
      );
      setSpaces(updatedSpaces);
      setNewTodos({ ...newTodos, [spaceId]: '' });

      gsap.from(`#space-${spaceId} li:last-child`, {
        opacity: 0,
        x: -20,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  };

  const handleTodoKeyPress = (e, spaceId) => {
    if (e.key === 'Enter') {
      addTodo(spaceId);
    }
  };

  const toggleTodo = (spaceId, todoId) => {
    const updatedSpaces = spaces.map(space => 
      space.id === spaceId
        ? {
            ...space,
            todos: space.todos.map(todo =>
              todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
            ),
          }
        : space
    );
    setSpaces(updatedSpaces);

    gsap.to(`#todo-${todoId}`, {
      scale: 1.05,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    });
  };

  const editTodo = (spaceId, todoId, newText) => {
    const updatedSpaces = spaces.map(space => 
      space.id === spaceId
        ? {
            ...space,
            todos: space.todos.map(todo =>
              todo.id === todoId ? { ...todo, text: newText } : todo
            ),
          }
        : space
    );
    setSpaces(updatedSpaces);
  };

  const deleteTodo = (spaceId, todoId) => {
    gsap.to(`#todo-${todoId}`, {
      opacity: 0,
      x: 20,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        const updatedSpaces = spaces.map(space => 
          space.id === spaceId
            ? {
                ...space,
                todos: space.todos.filter(todo => todo.id !== todoId),
              }
            : space
        );
        setSpaces(updatedSpaces);
        ScrollTrigger.refresh();
      },
    });
  };

  const deleteSpace = (spaceId) => {
    gsap.to(`#space-${spaceId}`, {
      opacity: 0,
      y: -30,
      duration: 0.6,
      ease: 'power3.in',
      onComplete: () => {
        setSpaces(spaces.filter(space => space.id !== spaceId));
        setNewTodos(prevNewTodos => {
          const {...rest } = prevNewTodos;
          return rest;
        });
        ScrollTrigger.refresh();
      },
    });
  };

  const deleteAllTodosInSpace = (spaceId) => {
    gsap.to(`#space-${spaceId} li`, {
      opacity: 0,
      x: 20,
      stagger: 0.1,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        const updatedSpaces = spaces.map(space => 
          space.id === spaceId ? { ...space, todos: [] } : space
        );
        setSpaces(updatedSpaces);
        ScrollTrigger.refresh();
      },
    });
  };

  const deleteAllSpaces = () => {
    gsap.to('.space', {
      opacity: 0,
      y: -30,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power3.in',
      onComplete: () => {
        setSpaces([]);
        setNewTodos({});
        ScrollTrigger.refresh();
      },
    });
  };

  return (
    <div ref={appRef} className="min-h-screen bg-gray-100 p-4 opacity-0 relative">
      <div ref={cursorRef} className="fixed w-4 h-4 bg-blue-500 rounded-full pointer-events-none mix-blend-difference" />
      
      {/* Local Storage Toggle */}
      <div className="top-4 left-4 flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Local Storage</span>
        <button
          onClick={toggleLocalStorage}
          className="w-12 h-6 bg-gray-300 rounded-full p-1 duration-300 ease-in-out"
        >
          <div
            id="localStorageToggle"
            className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
              useLocalStorage ? 'translate-x-6' : ''
            }`}
          ></div>
        </button>
        <FontAwesomeIcon icon={faSave} className={`text-blue-500 ${useLocalStorage ? 'opacity-100' : 'opacity-50'}`} />
      </div>

      <h1 className="text-3xl font-bold mt-10 mb-6 text-center">Minimalist To-Do</h1>
      
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          id="new-space-input"
          name="new-space-input"
          value={newSpaceName}
          onChange={(e) => setNewSpaceName(e.target.value)}
          onKeyPress={handleSpaceKeyPress}
          placeholder="New Space Name"
          className="p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={addSpace} 
          className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {spaces.map((space) => (
          <div key={space.id} id={`space-${space.id}`} className="space bg-white p-4 rounded shadow-md">
            <h2 className="text-xl font-semibold mb-3 flex justify-between items-center">
              {space.name}
              <button
                onClick={() => deleteSpace(space.id)}
                className="text-red-500 hover:text-red-700 transition-colors focus:outline-none"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </h2>
            <ul className="space-y-2">
              {space.todos.map((todo) => (
                <li key={todo.id} id={`todo-${todo.id}`} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`todo-checkbox-${todo.id}`}
                    name={`todo-checkbox-${todo.id}`}
                    checked={todo.completed}
                    onChange={() => toggleTodo(space.id, todo.id)}
                    className="mr-2"
                  />
                  <input
                    type="text"
                    id={`todo-text-${todo.id}`}
                    name={`todo-text-${todo.id}`}
                    value={todo.text}
                    onChange={(e) => editTodo(space.id, todo.id, e.target.value)}
                    className={`flex-grow bg-transparent focus:outline-none ${todo.completed ? 'line-through text-gray-500' : ''}`}
                  />
                  <button
                    onClick={() => deleteTodo(space.id, todo.id)}
                    className="ml-2 text-red-500 hover:text-red-700 transition-colors focus:outline-none"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex">
              <input
                type="text"
                id={`new-todo-input-${space.id}`}
                name={`new-todo-input-${space.id}`}
                value={newTodos[space.id]}
                onChange={(e) => setNewTodos({ ...newTodos, [space.id]: e.target.value })}
                onKeyPress={(e) => handleTodoKeyPress(e, space.id)}
                placeholder="New Todo"
                className="flex-grow p-1 border rounded-l focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={() => addTodo(space.id)}
                className="bg-green-500 text-white p-1 rounded-r hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-700"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <button
              onClick={() => deleteAllTodosInSpace(space.id)}
              className="mt-2 text-yellow-600 hover:text-yellow-700 transition-colors focus:outline-none text-sm"
            >
              <FontAwesomeIcon icon={faTrash} /> Clear All
            </button>
          </div>
        ))}
      </div>

      {spaces.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={deleteAllSpaces}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            <FontAwesomeIcon icon={faTrash} /> Delete All Spaces
          </button>
        </div>
      )}
    </div>
  );
}

export default ToDoApp;