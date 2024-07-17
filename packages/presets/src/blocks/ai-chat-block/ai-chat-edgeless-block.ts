import { Bound, toEdgelessBlockElement } from '@blocksuite/block-std';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { AIChatBlockComponent } from './ai-chat-block.js';

@customElement('affine-edgeless-ai-chat')
export class EdgelessAIChatBlockComponent extends toEdgelessBlockElement(
  AIChatBlockComponent
) {
  rootServiceFlavour!: 'affine:page';

  override renderEdgelessBlock() {
    const bound = Bound.deserialize(this.model.xywh$.value);
    const scale = this.model.scale$.value;
    const width = bound.w / scale;
    const height = bound.h / scale;
    const style = {
      width: `${width}px`,
      height: `${height}px`,
      borderRadius: '8px',
      transformOrigin: '0 0',
      boxShadow: 'var(--affine-shadow-1)',
      border: '1px solid var(--affine-border-color)',
      transform: `scale(${scale})`,
    };

    return html`
      <div class="edgeless-ai-chat" style=${styleMap(style)}>
        ${this.renderPageContent()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'affine-edgeless-ai-chat': EdgelessAIChatBlockComponent;
  }
}