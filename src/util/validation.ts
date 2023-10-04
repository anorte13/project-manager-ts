/* Validation interface logic */

export interface ValidInputs {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export function validate(validatedInputs: ValidInputs) {
  let isValid = true;
  if (validatedInputs.required) {
    isValid = isValid && validatedInputs.value.toString().trim().length !== 0;
  }
  if (
    validatedInputs.minLength !== undefined &&
    typeof validatedInputs.value === "string"
  ) {
    isValid =
      isValid && validatedInputs.value.length >= validatedInputs.minLength;
  }
  if (
    validatedInputs.maxLength !== undefined &&
    typeof validatedInputs.value === "string"
  ) {
    isValid =
      isValid && validatedInputs.value.length <= validatedInputs.maxLength;
  }
  if (
    validatedInputs.min != null &&
    typeof validatedInputs.value === "number"
  ) {
    isValid = isValid && validatedInputs.value >= validatedInputs.min;
  }
  if (
    validatedInputs.max != null &&
    typeof validatedInputs.value === "number"
  ) {
    isValid = isValid && validatedInputs.value < validatedInputs.max;
  }
  return isValid;
}
