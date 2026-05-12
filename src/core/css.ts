import type { CssInspectorEntry } from '../types';

export function collectComputedStyles(element: HTMLElement, changedProperties: Set<string>): CssInspectorEntry[] {
  const computed = window.getComputedStyle(element);

  return Array.from(computed)
    .sort((left, right) => left.localeCompare(right))
    .map((property) => ({
      property,
      value: computed.getPropertyValue(property).trim(),
      changed: changedProperties.has(property)
    }));
}

export function collectDefinedStyles(element: HTMLElement, changedProperties: Set<string>): CssInspectorEntry[] {
  const properties = new Map<string, CssInspectorEntry>();

  const writeEntry = (property: string, value: string, source?: string) => {
    const normalizedValue = value.trim();
    if (!normalizedValue) {
      return;
    }

    properties.set(property, {
      property,
      value: normalizedValue,
      source,
      changed: changedProperties.has(property)
    });
  };

  for (const stylesheet of Array.from(document.styleSheets)) {
    collectMatchedRules(element, stylesheet, writeEntry);
  }

  for (const property of Array.from(element.style)) {
    writeEntry(property, element.style.getPropertyValue(property), 'inline style');
  }

  return Array.from(properties.values()).sort((left, right) => left.property.localeCompare(right.property));
}

function collectMatchedRules(
  element: HTMLElement,
  stylesheet: CSSStyleSheet,
  writeEntry: (property: string, value: string, source?: string) => void
): void {
  let rules: CSSRuleList;
  try {
    rules = stylesheet.cssRules;
  } catch {
    return;
  }

  visitRules(element, rules, writeEntry);
}

function visitRules(
  element: HTMLElement,
  rules: CSSRuleList,
  writeEntry: (property: string, value: string, source?: string) => void
): void {
  for (const rule of Array.from(rules)) {
    if (rule.type === CSSRule.STYLE_RULE) {
      const styleRule = rule as CSSStyleRule;
      const selectors = splitSelectors(styleRule.selectorText);
      if (!selectors.some((selector) => safelyMatches(element, selector))) {
        continue;
      }

      for (const property of Array.from(styleRule.style)) {
        writeEntry(property, styleRule.style.getPropertyValue(property), styleRule.selectorText);
      }
      continue;
    }

    if ('cssRules' in rule) {
      visitRules(element, (rule as CSSGroupingRule).cssRules, writeEntry);
    }
  }
}

function splitSelectors(selectorText: string): string[] {
  return selectorText
    .split(',')
    .map((selector) => selector.trim())
    .filter(Boolean);
}

function safelyMatches(element: HTMLElement, selector: string): boolean {
  try {
    return element.matches(selector);
  } catch {
    return false;
  }
}
