import { describe, expect, it } from 'vitest';
import { upsertManagedBlock } from '../src/managed-block.js';

describe('managed blocks', () => {
  it('preserves user content and is idempotent', () => {
    const original = '# User rules\n\nDo not delete this.\n';
    const first = upsertManagedBlock(original, 'agents', 'Managed text');
    const second = upsertManagedBlock(first, 'agents', 'Managed text');
    expect(first).toContain('Do not delete this.');
    expect(second).toBe(first);
  });

  it('updates only the managed region', () => {
    const first = upsertManagedBlock('Before\n', 'agents', 'Old');
    const second = upsertManagedBlock(first, 'agents', 'New');
    expect(second).toContain('Before');
    expect(second).toContain('New');
    expect(second).not.toContain('\nOld\n');
  });

  it('refuses to guess when managed markers are malformed', () => {
    const malformed = '# User rules\n\n<!-- agentdocs:agents:start -->\nManaged text\n';
    expect(() => upsertManagedBlock(malformed, 'agents', 'Replacement')).toThrow(/Malformed AgentDocs managed block/);
  });
});
