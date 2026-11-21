import { useController } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { TextField } from '../common/TextField';
import type { TextFieldProps } from '../common/TextField';

type FormTextFieldProps<T extends FieldValues, TOut> = Omit<
  TextFieldProps,
  'value' | 'onChangeText' | 'error' | 'ref'
> & {
  control: Control<T, unknown, TOut>;
  name: Path<T>;
};

export function FormTextField<T extends FieldValues, TOut = T>({
  control,
  name,
  onBlur,
  ...rest
}: FormTextFieldProps<T, TOut>) {
  const { field, fieldState } = useController({ control, name });

  return (
    <TextField
      {...rest}
      ref={field.ref}
      value={field.value ?? ''}
      onChangeText={field.onChange}
      onBlur={e => {
        field.onBlur();
        onBlur?.(e);
      }}
      error={fieldState.error?.message}
    />
  );
}
