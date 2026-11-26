// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { EnlargeButton, useEnlarged } from './writeFocus';

function Probe() {
  const box = useRef<HTMLDivElement>(null);
  const [on, toggle] = useEnlarged(box);
  return (
    <div ref={box} className={on ? 'is-enlarged' : undefined}>
      <EnlargeButton on={on} onToggle={toggle} />
    </div>
  );
}

describe('the field enlarged', () => {
  afterEach(cleanup);

  it('opens with the arrows, named for VoiceOver, and closes with them again', () => {
    const { getByRole, container } = render(<Probe />);
    const root = document.documentElement;
    fireEvent.click(getByRole('button', { name: 'Vergrößern' }));
    expect(root.classList.contains('write-focus')).toBe(true);
    expect(container.querySelector('.is-enlarged')).not.toBeNull();
    fireEvent.click(getByRole('button', { name: 'Verkleinern' }));
    expect(root.classList.contains('write-focus')).toBe(false);
  });

  it('closes with Escape and leaves nothing behind when the page goes', () => {
    const { getByRole, unmount } = render(<Probe />);
    const root = document.documentElement;
    fireEvent.click(getByRole('button', { name: 'Vergrößern' }));
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(root.classList.contains('write-focus')).toBe(false);
    fireEvent.click(getByRole('button', { name: 'Vergrößern' }));
    unmount();
    expect(root.classList.contains('write-focus')).toBe(false);
  });
});
