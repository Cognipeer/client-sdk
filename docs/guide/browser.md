# Browser Usage

Use `CognipeerWebchat` for zero-backend deployments or embed the SDK into your own SPA.

## Webchat Widget

```typescript
import { CognipeerWebchat } from '@cognipeer/sdk';

const widget = CognipeerWebchat.createWidget({
  hookId: 'your-hook-id',
  position: 'bottom-right',
  buttonColor: '#14b8a6'
});

widget.mount();
```

- Works with channel hook IDs so no PAT is exposed.
- Runs entirely in the browser and communicates directly with Cognipeer.

## Custom Embeds

```typescript
const webchat = new CognipeerWebchat({
  hookId: 'your-hook-id',
  tools: [getCurrentTimeTool]
});

webchat.mount({
  containerId: 'chat-container',
  width: '100%',
  height: '600px'
});
```

Register client tools to access browser APIs (geolocation, notifications, DOM updates).

## Environment Considerations

- Serve your site over HTTPS so the iframe and postMessage integrations succeed.
- Keep hook IDs in `.env` files and inject them at build time; never fetch PATs to the browser.
- Use CSP headers that allow `https://app.cognipeer.com` frames.

## SSR Frameworks

When using Next.js, Remix, or SvelteKit, import `CognipeerWebchat` inside client components to avoid SSR issues:

```typescript
'use client';
import { useEffect } from 'react';
import { CognipeerWebchat } from '@cognipeer/sdk';

export function Chat() {
  useEffect(() => {
    const chat = new CognipeerWebchat({ hookId: process.env.NEXT_PUBLIC_HOOK_ID! });
    chat.mount({ containerId: 'chat' });
  }, []);

  return <div id="chat" style={{ height: 600 }} />;
}
```

## Related

- [Webchat Client Tools Example](/examples/webchat-client-tools)
- [Client Tools Guide](/guide/client-tools)
- [Authentication](/guide/authentication)
