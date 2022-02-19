import update from 'immutability-helper';
import { createContext, ReactNode, Reducer, useContext, useMemo, useReducer, useRef } from 'react';

import type { NotificationProps } from '@/frontend/components/Notification';
import Notification from '@/frontend/components/Notification';

type NotificationContent = Pick<NotificationProps, 'variant' | 'title' | 'content' | 'className'>;

export type AssertiveState = {
  notiFlag: boolean;
  notiContent: NotificationContent;
};

const initialState: AssertiveState = {
  notiFlag: false,
  notiContent: { variant: 'default', title: '' },
};

type AssertiveStoreAction =
  | { type: 'RESET' }
  | { type: 'CLOSE_NOTI' }
  | { type: 'SHOW_NOTI'; notiContent: NotificationContent }
  | { type: 'SHOW_ALERT'; error: { name: string; message: string } };

export const AssertiveContext = createContext<AssertiveState>(initialState);

const assertiveReducer: Reducer<AssertiveState, AssertiveStoreAction> = (state, action) => {
  switch (action.type) {
    case 'RESET':
      return initialState;
    case 'CLOSE_NOTI':
      return update(state, {
        notiFlag: { $set: false },
      });
    case 'SHOW_NOTI':
      return update(state, {
        notiFlag: { $set: true },
        notiContent: { $set: action.notiContent },
      });
    case 'SHOW_ALERT':
      const { name, message } = action.error;
      return update(state, {
        notiFlag: { $set: true },
        notiContent: { $set: { variant: 'alert', title: `[${name}] - ${message}` } },
      });
  }
};

type AssertiveStore = AssertiveState & {
  resetStore: () => void;
  closeNoti: () => void;
  showNoti: (notiContent: NotificationContent, autoCloseMS?: number) => void;
  showAlert: (error: { name: string; message: string }, autoCloseMS?: number) => void;
};

export function AssertiveStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(assertiveReducer, initialState);
  const notiTimer = useRef<NodeJS.Timeout>();

  const resetStore = () => dispatch({ type: 'RESET' });
  const closeNoti = () => {
    if (notiTimer.current) clearTimeout(notiTimer.current);
    dispatch({ type: 'CLOSE_NOTI' });
  };
  const showNoti = (notiContent: NotificationContent, autoCloseMS = 3000) => {
    dispatch({ type: 'SHOW_NOTI', notiContent });
    if (notiTimer.current) clearTimeout(notiTimer.current);
    notiTimer.current = setTimeout(() => dispatch({ type: 'CLOSE_NOTI' }), autoCloseMS);
  };
  const showAlert = (error: { name: string; message: string }, autoCloseMS = 3000) => {
    dispatch({ type: 'SHOW_ALERT', error });
    if (notiTimer.current) clearTimeout(notiTimer.current);
    notiTimer.current = setTimeout(() => dispatch({ type: 'CLOSE_NOTI' }), autoCloseMS);
  };

  const value = useMemo<AssertiveStore>(
    () => ({
      ...state,
      resetStore,
      closeNoti,
      showNoti,
      showAlert,
    }),
    [state],
  );

  return (
    <AssertiveContext.Provider value={value}>
      {children}
      <Notification show={state.notiFlag} close={closeNoti} {...state.notiContent} />
    </AssertiveContext.Provider>
  );
}

export const useAssertiveStore = () => {
  const context = useContext(AssertiveContext);

  if (context === undefined) {
    throw new Error(`useAssertiveStore must be used within a AssertiveStoreProvider`);
  }

  return context as AssertiveStore;
};
