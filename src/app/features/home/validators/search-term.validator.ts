import { ValidatorFn } from '@angular/forms';

export function searchTermValidator(): ValidatorFn {
    return control => {
        const searchInput = control.value;
        const match = searchInput.match(/^\d?\s?[a-zA-Z]+\s\d+:\s?\d+(-\d+)?$/);
        return match !== null ? null : { invalidSearchTerm: true };
    };
}
