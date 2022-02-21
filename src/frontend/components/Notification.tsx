import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline';
import { XIcon } from '@heroicons/react/solid';
import clsx from 'clsx';
import { Fragment } from 'react';

export interface NotificationProps {
  variant?: 'default' | 'alert';
  show: boolean;
  close: () => void;
  title: string;
  content?: string;
  className?: string;
}

export default function Notification({
  variant = 'default',
  show,
  close,
  title,
  content,
  className,
}: NotificationProps) {
  return (
    <div
      aria-live="assertive"
      className={clsx(
        className,
        'pointer-events-none fixed inset-0 flex items-end justify-center px-4 py-6 sm:items-start sm:justify-end sm:p-6',
      )}
    >
      {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
      <Transition
        show={show}
        as={Fragment}
        enter="ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-4">
            <div
              className={clsx('flex', {
                'items-start': Boolean(content),
                'items-center': !content,
              })}
            >
              <div className="flex-shrink-0">
                <CheckCircleIcon
                  className={clsx('h-6 w-6 text-[#34D399]', {
                    hidden: variant !== 'default',
                  })}
                />
                <XCircleIcon
                  className={clsx('h-6 w-6 text-[#F87171]', {
                    hidden: variant !== 'alert',
                  })}
                />
              </div>
              <div
                className={clsx('ml-3 w-0 flex-1 pt-0.5', {
                  'flex items-center': !content,
                })}
              >
                <p className="font-semibold text-gray-900">{title}</p>
                <p className="mt-1 font-medium leading-5 text-gray-500">{content}</p>
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={close}
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}
