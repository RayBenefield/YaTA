import { HTMLInputProps, IInputGroupProps, InputGroup } from '@blueprintjs/core'
import * as React from 'react'

/**
 * SettingsInput Component.
 */
const SettingsInput: React.SFC<IInputGroupProps & HTMLInputProps> = (props) => (
  <InputGroup autoCorrect="off" spellCheck={false} {...props} />
)

export default SettingsInput
