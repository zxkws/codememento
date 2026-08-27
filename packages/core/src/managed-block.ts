export function markers(id: string): { start: string; end: string } {
  return {
    start: `<!-- agentdocs:${id}:start -->`,
    end: `<!-- agentdocs:${id}:end -->`,
  };
}

export function renderManagedBlock(id: string, content: string): string {
  const { start, end } = markers(id);
  return `${start}\n${content.trim()}\n${end}`;
}

export function upsertManagedBlock(existing: string, id: string, content: string): string {
  const { start, end } = markers(id);
  const block = renderManagedBlock(id, content);
  const startIndex = existing.indexOf(start);
  const endIndex = existing.indexOf(end);

  const startCount = existing.split(start).length - 1;
  const endCount = existing.split(end).length - 1;
  if (startCount !== endCount || startCount > 1 || (endIndex >= 0 && endIndex < startIndex)) {
    throw new Error(`Malformed AgentDocs managed block for adapter "${id}". Fix the markers before running sync.`);
  }

  if (startIndex >= 0 && endIndex >= startIndex) {
    const after = endIndex + end.length;
    return `${existing.slice(0, startIndex)}${block}${existing.slice(after)}`;
  }

  if (!existing.trim()) return `${block}\n`;
  return `${existing.trimEnd()}\n\n${block}\n`;
}

export function extractManagedBlock(existing: string, id: string): string | undefined {
  const { start, end } = markers(id);
  const startIndex = existing.indexOf(start);
  const endIndex = existing.indexOf(end);
  const startCount = existing.split(start).length - 1;
  const endCount = existing.split(end).length - 1;
  if (startCount !== endCount || startCount > 1 || (endIndex >= 0 && endIndex < startIndex)) {
    throw new Error(`Malformed AgentDocs managed block for adapter "${id}".`);
  }
  if (startIndex < 0 || endIndex < startIndex) return undefined;
  return existing.slice(startIndex, endIndex + end.length);
}
