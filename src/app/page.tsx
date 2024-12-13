'use client';

import { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Task = {
  title: string;
  id: string;
  timer: number;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedTimer, setEditedTimer] = useState<string>('10:00');
  const inputReference = useRef<HTMLInputElement>(null);

  const timeStringToSeconds = (time: string) => {
    const [minutes, seconds] = time.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const secondsToTimeString = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddTask = () => {
    const inputValue = inputReference?.current?.value as string;
    if (inputValue && /^([0-9]{1,2}):([0-9]{2})$/.test(editedTimer)) {
      const newTask: Task = {
        title: inputValue,
        id: nanoid(),
        timer: timeStringToSeconds(editedTimer),
      };

      setTasks([newTask, ...tasks]);
      if (inputReference.current) {
        inputReference.current.value = '';
      }

      toast.success('Task added successfully!', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      toast.warning('Please enter a task and set a valid timer (HH:mm).', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTitle(task.title);
    setEditedTimer(secondsToTimeString(task.timer));
  };

  const handleSaveEdit = (taskId: string) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId
          ? { ...task, title: editedTitle, timer: timeStringToSeconds(editedTimer) }
          : task
      )
    );
    setEditingTaskId(null);
    setEditedTitle('');
    setEditedTimer('10:00');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast.error('Task deleted successfully!', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: 'bg-red-600 text-white',
    });
  };

  useEffect(() => {
    const timers = tasks.map((task) => {
      if (task.timer > 0) {
        const intervalId = setInterval(() => {
          setTasks(prevTasks => {
            const updatedTasks = prevTasks.map(t => {
              if (t.id === task.id && t.timer > 0) {
                const updatedTimer = t.timer - 1;
                if (updatedTimer === 0) {
                  toast.info(`${t.title} timer expired!`, {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                }
                return { ...t, timer: updatedTimer };
              }
              return t;
            });
            return updatedTasks;
          });
        }, 1000);

        // Return the interval ID to clear it later
        return intervalId;
      }
      return null;
    });

    return () => {
      timers.forEach((timer) => {
        if (timer) {
          clearInterval(timer);
        }
      });
    };
  }, [tasks]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10 px-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Task Manager</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            ref={inputReference}
            className="sm:w-[600px] md:w-[600px] lg:w-[682px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-black"
            placeholder="Enter a new task..."
            onKeyDown={handleKeyDown}
          />
          <input
            type="text"
            value={editedTimer}
            onChange={(e) => setEditedTimer(e.target.value)}
            className="sm:w-[100px] md:w-[100px] lg:w-[120px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-black"
            placeholder="Timer (HH:mm)"
          />
          <button
            onClick={handleAddTask}
            className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 text-sm sm:w-[160px] md:w-[160px] lg:w-[160px]"
          >
            Add Task
          </button>
        </div>

        <ul className="space-y-4">
          {tasks.map((elem: Task) => (
            <li
              key={elem.id}
              className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-3 rounded-lg text-sm"
            >
              {editingTaskId === elem.id ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full sm:w-[282px] p-3 border border-gray-300 rounded-lg text-sm text-black mb-2 sm:mb-0"
                />
              ) : (
                <span className="text-gray-800 text-sm font-bold">{elem.title}</span>
              )}

              <span className="text-black text-xs">
                {secondsToTimeString(elem.timer)}
              </span>

              <div className="flex gap-2">
                {editingTaskId === elem.id ? (
                  <button
                    onClick={() => handleSaveEdit(elem.id)}
                    className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition duration-200 text-sm w-20"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => handleEditTask(elem)}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition duration-200 text-sm w-20"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => handleDeleteTask(elem.id)}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition duration-200 text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-2 14H7L5 7M9 3V4h6V3m1-2h-8a1 1 0 00-1 1v2h10V2a1 1 0 00-1-1z"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ToastContainer
        className="sm:px-4 md:px-6 lg:px-8"
        toastClassName="sm:w-[90%] md:w-[80%] lg:w-[60%] max-w-[90%] mx-auto"
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        closeOnClick={true}
        pauseOnHover={true}
        draggable={true}
      />
    </div>
  );
}
