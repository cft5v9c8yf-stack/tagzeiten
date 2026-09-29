import { Fragment, useId, type ReactNode } from 'react';
import { setOpen, useOpenStates } from './collapseState';
import { FlowIcon, type FlowIconName } from './FlowIcon';
import { InfoToggle } from './Section';

export interface TileItem {
  /** Stable key, also the remembered open state (e.g. "more.display"). */
  id: string;
  title: string;
  /** One quiet line under the title: what is set there, or what it holds. */
  line?: ReactNode;
  icon: FlowIconName;
  /** Explanation behind an "i" in the opened panel. */
  info?: ReactNode;
  content: ReactNode;
  /** Open until the user closes it (otherwise closed until opened). */
  defaultOpen?: boolean;
}

const PER_ROW = 2;

/**
 * A group of settings or parts as tiles, two side by side, each with its icon,
 * title and a line of what it holds. A tile opens its content beneath its row,
 * across the full width; several may be open. Open states are remembered on
 * the device like the folding headings.
 */
export function TileGroup({ items, level = 3, label }: { items: readonly TileItem[]; level?: 3 | 4 | 5; label?: string }) {
  const base = useId();
  const open = useOpenStates();
  const Heading = `h${level}` as 'h3' | 'h4' | 'h5';
  const rows: TileItem[][] = [];
  for (let i = 0; i < items.length; i += PER_ROW) rows.push(items.slice(i, i + PER_ROW));
  const isOpen = (it: TileItem) => open[it.id] ?? !!it.defaultOpen;
  const panelId = (it: TileItem) => `${base}-${it.id.replace(/\W/g, '-')}`;

  return (
    <div className="tile-group" role="group" aria-label={label}>
      {rows.map((row, r) => (
        <Fragment key={r}>
          {row.map((it) => {
            const opened = isOpen(it);
            return (
              <button
                key={it.id}
                type="button"
                className={`tile-card${opened ? ' is-open' : ''}`}
                aria-expanded={opened}
                aria-controls={panelId(it)}
                onClick={() => setOpen(it.id, !opened)}
              >
                <FlowIcon name={it.icon} size={22} />
                <span className="tile-card-title">{it.title}</span>
                {it.line !== undefined && <span className="tile-card-line">{it.line}</span>}
              </button>
            );
          })}
          {row.map((it) => (
            <section
              key={`${it.id}-panel`}
              id={panelId(it)}
              className="tile-panel"
              aria-labelledby={`${panelId(it)}-h`}
              hidden={!isOpen(it)}
            >
              <div className="tile-panel-head">
                <Heading id={`${panelId(it)}-h`} className="tile-panel-title">
                  {it.title}
                </Heading>
                {it.info && <InfoToggle title={it.title}>{it.info}</InfoToggle>}
              </div>
              {isOpen(it) && it.content}
            </section>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
