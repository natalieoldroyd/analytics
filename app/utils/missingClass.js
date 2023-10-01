export function missingClass(string, prefix) {
    if (!string) {
      return true;
    }

    const regex = new RegExp(` ?${prefix}`, 'g');
    return string.match(regex) === null;
  }
