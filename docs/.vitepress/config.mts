import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Cognipeer SDK',
  description: 'Official JavaScript/TypeScript SDK for Cognipeer AI',
  base: '/client-sdk/',
  
  themeConfig: {
    
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/client' },
      { text: 'Examples', link: '/examples/basic' },
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Client Configuration', link: '/guide/configuration' },
            { text: 'Conversations', link: '/guide/conversations' },
            { text: 'Client Tools', link: '/guide/client-tools' },
            { text: 'Flows', link: '/guide/flows' },
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Error Handling', link: '/guide/error-handling' },
            { text: 'TypeScript Support', link: '/guide/typescript' },
            { text: 'Browser Usage', link: '/guide/browser' },
          ]
        }
      ],
      
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'CognipeerClient', link: '/api/client' },
            { text: 'Conversations', link: '/api/conversations' },
            { text: 'Flows', link: '/api/flows' },
            { text: 'Types', link: '/api/types' },
          ]
        }
      ],
      
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Usage', link: '/examples/basic' },
            { text: 'Client Tools', link: '/examples/client-tools' },
            { text: 'Structured Output', link: '/examples/structured-output' },
            { text: 'Browser Integration', link: '/examples/browser' },
            { text: 'Real-world Use Cases', link: '/examples/use-cases' },
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/cognipeer/client-sdk' }
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Cognipeer'
    }
  }
});
