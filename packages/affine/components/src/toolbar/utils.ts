import { html, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { join } from 'lit/directives/join.js';
import { repeat } from 'lit/directives/repeat.js';

import type { FatMenuItems, MenuItem, MoreMenuItemGroup } from './types.js';

export function groupsToActions<T>(
  groups: MoreMenuItemGroup<T>[],
  context: T
): MenuItem[][] {
  return groups
    .filter(group => group.when?.(context) ?? true)
    .map(({ items }) =>
      items
        .filter(item => item.when?.(context) ?? true)
        .map(({ icon, label, type, action, disabled, generate }) => {
          if (action && typeof action === 'function') {
            return {
              icon,
              label,
              type,
              action: () => {
                action(context)?.catch(console.error);
              },
              disabled:
                typeof disabled === 'function' ? disabled(context) : disabled,
            };
          }

          if (generate && typeof generate === 'function') {
            const result = generate(context);

            if (!result) return;

            return {
              icon,
              label,
              type,
              ...result,
            };
          }

          return;
        })
        .filter(item => !!item)
    );
}

export function renderActions(
  fatMenuItems: FatMenuItems,
  action?: (item: MenuItem) => Promise<void> | void,
  selectedName?: string
) {
  return join(
    fatMenuItems
      .filter(g => g.length)
      .map(g => g.filter(a => a !== nothing) as MenuItem[])
      .filter(g => g.length)
      .map(items =>
        repeat(
          items,
          item => item.label,
          item => html`
            <editor-menu-action
              aria-label=${item.label}
              class=${classMap({
                delete: item.type === 'delete',
              })}
              ?data-selected=${selectedName === item.label}
              ?disabled=${item.disabled}
              @click=${item.action ? item.action : () => action?.(item)}
            >
              ${item.icon}<span class="label">${item.label}</span>
            </editor-menu-action>
          `
        )
      ),
    () => html`
      <editor-toolbar-separator
        data-orientation="horizontal"
      ></editor-toolbar-separator>
    `
  );
}

export function renderToolbarSeparator() {
  return html`<editor-toolbar-separator></editor-toolbar-separator>`;
}
