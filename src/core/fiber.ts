import { getDisplayName, getFiberFromHostInstance, getLatestFiber, isCompositeFiber, type Fiber } from 'bippy';
import { formatOwnerStack, getFallbackOwnerStack, getSource, hasDebugStack, isSourceFile, normalizeFileName, parseStack } from 'bippy/source';

export interface FiberMetadata {
  componentName: string | null;
  filePath: string | null;
  lineNumber: number | null;
}

interface SourceLikeLocation {
  filePath: string | null;
  lineNumber: number | null;
}

function findNearestCompositeFiber(startFiber: Fiber | null): Fiber | null {
  let current = startFiber;
  while (current) {
    if (isCompositeFiber(current)) {
      return current;
    }
    current = current.return;
  }
  return null;
}

function getCompositeAncestors(startFiber: Fiber | null): Fiber[] {
  const fibers: Fiber[] = [];
  let current = startFiber;
  while (current) {
    if (isCompositeFiber(current)) {
      fibers.push(current);
    }
    current = current.return;
  }
  return fibers;
}

function getFallbackSourceLocation(fiber: Fiber): SourceLikeLocation | null {
  const stackFrames = parseStack(getFallbackOwnerStack(fiber));

  for (const frame of stackFrames) {
    if (!frame.fileName) {
      continue;
    }

    const normalizedFileName = normalizeFileName(frame.fileName);
    if (!normalizedFileName) {
      continue;
    }

    if (isSourceFile(normalizedFileName) || normalizedFileName.startsWith('/src/')) {
      return {
        filePath: normalizedFileName,
        lineNumber: frame.lineNumber ?? null
      };
    }
  }

  for (const frame of stackFrames) {
    if (!frame.fileName) {
      continue;
    }

    const normalizedFileName = normalizeFileName(frame.fileName);
    if (!normalizedFileName) {
      continue;
    }

    return {
      filePath: normalizedFileName,
      lineNumber: frame.lineNumber ?? null
    };
  }

  return null;
}

function getDebugStackSourceLocation(fiber: Fiber): SourceLikeLocation | null {
  if (!hasDebugStack(fiber)) {
    return null;
  }

  const stackFrames = parseStack(formatOwnerStack(fiber._debugStack.stack));
  for (const frame of stackFrames) {
    if (!frame.fileName) {
      continue;
    }

    const normalizedFileName = normalizeFileName(frame.fileName);
    if (!normalizedFileName) {
      continue;
    }

    if (isSourceFile(normalizedFileName) || normalizedFileName.startsWith('/src/')) {
      return {
        filePath: normalizedFileName,
        lineNumber: frame.lineNumber ?? null
      };
    }
  }

  return null;
}

export async function resolveFiberMetadata(element: HTMLElement): Promise<FiberMetadata> {
  try {
    const initialFiber = getFiberFromHostInstance(element);
    if (!initialFiber) {
      return { componentName: null, filePath: null, lineNumber: null };
    }

    const hostFiber = getLatestFiber(initialFiber);
    if (!hostFiber) {
      return { componentName: null, filePath: null, lineNumber: null };
    }

    const compositeFiber = findNearestCompositeFiber(hostFiber);
    if (!compositeFiber) {
      return { componentName: null, filePath: null, lineNumber: null };
    }

    const compositeFibers = getCompositeAncestors(hostFiber);
    let filePath: string | null = null;
    let lineNumber: number | null = null;

    for (const fiber of compositeFibers) {
      const source = await getSource(fiber).catch(() => null);
      if (source?.fileName) {
        filePath = normalizeFileName(source.fileName) || source.fileName;
        lineNumber = source.lineNumber ?? null;
        break;
      }

      const debugStackSource = getDebugStackSourceLocation(fiber);
      if (debugStackSource?.filePath) {
        filePath = debugStackSource.filePath;
        lineNumber = debugStackSource.lineNumber;
        break;
      }

      const fallbackSource = getFallbackSourceLocation(fiber);
      if (fallbackSource?.filePath) {
        filePath = fallbackSource.filePath;
        lineNumber = fallbackSource.lineNumber;
        break;
      }
    }

    return {
      componentName: getDisplayName(compositeFiber.type) || null,
      filePath,
      lineNumber
    };
  } catch {
    return { componentName: null, filePath: null, lineNumber: null };
  }
}
