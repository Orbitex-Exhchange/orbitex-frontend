declare module 'react-maskinput' {
  import { Component } from 'react';
  
  interface MaskInputProps {
    mask: string;
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
    readOnly?: boolean;
    [key: string]: any;
  }
  
  export default class MaskInput extends Component<MaskInputProps> {}
}
