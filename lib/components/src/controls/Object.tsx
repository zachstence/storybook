import { window } from 'global';
import React, { SyntheticEvent, useCallback, useMemo } from 'react';
import { styled, useTheme, Theme } from '@storybook/theming';

import { JsonTree, JsonTreeProps } from 'react-editable-json-tree';
import type { ControlProps, ObjectValue, ObjectConfig } from './types';
import { Icons } from '../icon/icon';

const Wrapper = styled.label(({ theme }) => ({
  display: 'flex',

  '.rejt-tree': {
    marginLeft: '1rem',
  },
  '.rejt-value-node, .rejt-object-node > .rejt-collapsed, .rejt-array-node > .rejt-collapsed, .rejt-object-node > .rejt-not-collapsed > span, .rejt-array-node > .rejt-not-collapsed > span': {
    '& > svg': {
      opacity: 0,
      transition: 'opacity 0.2s',
    },
  },
  '.rejt-value-node:hover, .rejt-object-node:hover > .rejt-collapsed, .rejt-array-node:hover > .rejt-collapsed, .rejt-object-node:hover > .rejt-not-collapsed > span, .rejt-array-node:hover > .rejt-not-collapsed > span': {
    '& > svg': {
      opacity: 1,
    },
  },
  '.rejt-edit-form button': {
    display: 'none',
  },
  '.rejt-add-value-node': {
    display: 'inline-flex',
    alignItems: 'center',
  },
  '.rejt-name': {
    lineHeight: '22px',
  },
  '.rejt-not-collapsed-delimiter': {
    marginRight: 5,
    lineHeight: '22px',
  },
  '.rejt-plus-menu': {
    marginLeft: 2,
  },
  '.rejt-object-node > span > *': {
    position: 'relative',
    zIndex: 2,
  },
  '.rejt-object-node, .rejt-array-node': {
    position: 'relative',
  },
  '.rejt-object-node > span:first-child::after, .rejt-array-node > span:first-child::after, .rejt-collapsed::before, .rejt-not-collapsed::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    display: 'block',
    width: '100%',
    marginLeft: '-1rem',
    padding: '0 4px 0 1rem',
    height: 22,
  },
  '.rejt-collapsed::before, .rejt-not-collapsed::before': {
    zIndex: 1,
    background: 'transparent',
    borderRadius: 4,
    transition: 'background 0.2s',
    pointerEvents: 'none',
    opacity: 0.1,
  },
  '.rejt-object-node:hover, .rejt-array-node:hover': {
    '& > .rejt-collapsed::before, & > .rejt-not-collapsed::before': {
      background: theme.color.secondary,
    },
  },
  '.rejt-collapsed::after, .rejt-not-collapsed::after': {
    content: '""',
    position: 'absolute',
    display: 'inline-block',
    pointerEvents: 'none',
    width: 0,
    height: 0,
  },
  '.rejt-collapsed::after': {
    left: -8,
    top: 8,
    borderTop: '3px solid transparent',
    borderBottom: '3px solid transparent',
    borderLeft: '3px solid rgba(153,153,153,0.6)',
  },
  '.rejt-not-collapsed::after': {
    left: -10,
    top: 10,
    borderTop: '3px solid rgba(153,153,153,0.6)',
    borderLeft: '3px solid transparent',
    borderRight: '3px solid transparent',
  },
  '.rejt-value': {
    display: 'inline-block',
    border: '1px solid transparent',
    borderRadius: 4,
    margin: '1px 0',
    padding: '0 4px',
    cursor: 'text',
    color: theme.color.darkest,
  },
  '.rejt-value-node:hover > .rejt-value': {
    borderColor: theme.color.border,
  },
}));

const Button = styled.button<{ primary?: boolean }>(({ theme, primary }) => ({
  border: 0,
  height: 20,
  margin: 1,
  borderRadius: 4,
  background: primary ? theme.color.secondary : 'transparent',
  color: primary ? theme.color.lightest : theme.color.dark,
  fontWeight: primary ? 'bold' : 'normal',
  cursor: 'pointer',
  order: primary ? 'initial' : 9,
}));

const ActionIcon = styled(Icons)(({ theme, icon }) => ({
  display: 'inline-block',
  verticalAlign: 'middle',
  width: 15,
  height: 15,
  padding: 3,
  marginLeft: 5,
  cursor: 'pointer',
  color: theme.color.mediumdark,
  '&:hover': {
    color: icon === 'subtract' ? theme.color.negative : theme.color.ancillary,
  },
  'svg + &': {
    marginLeft: 0,
  },
}));

const Input = styled.input(({ theme, placeholder }) => ({
  outline: 0,
  margin: placeholder ? '0 1px' : '1px 0',
  padding: placeholder ? '2px 4px' : '3px 4px',
  border: `1px solid ${theme.color.secondary}`,
  borderRadius: 4,
  lineHeight: '14px',
  width: placeholder === 'Key' ? 80 : 120,
}));

const ENTER_EVENT = { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 };
const dispatchEnterKey = (event: SyntheticEvent<HTMLInputElement>) => {
  event.currentTarget.dispatchEvent(new window.KeyboardEvent('keydown', ENTER_EVENT));
};
const selectValue = (event: SyntheticEvent<HTMLInputElement>) => {
  event.currentTarget.select();
};

export type ObjectProps = ControlProps<ObjectValue> &
  ObjectConfig & {
    theme: any; // TODO: is there a type for this?
  };

const getCustomStyleFunction: (theme: Theme) => JsonTreeProps['getStyle'] = (theme) => () => ({
  name: {
    color: theme.color.secondary,
  },
  collapsed: {
    color: theme.color.dark,
  },
  ul: {
    listStyle: 'none',
    margin: '0 0 0 1rem',
    padding: 0,
  },
  li: {
    outline: 0,
  },
});

export const ObjectControl: React.FC<ObjectProps> = ({ name, value = {}, onChange }) => {
  const handleChange = useCallback(
    (data: ObjectValue) => {
      onChange(data);
    },
    [onChange]
  );

  const theme = useTheme() as Theme;

  const customStyleFunction = useMemo(() => getCustomStyleFunction(theme), [theme]);

  return (
    <Wrapper>
      <JsonTree
        data={value}
        onFullyUpdate={handleChange}
        rootName="root"
        getStyle={customStyleFunction}
        cancelButtonElement={<Button type="button">Cancel</Button>}
        editButtonElement={<Button type="submit">Save</Button>}
        addButtonElement={
          <Button type="submit" primary>
            Save
          </Button>
        }
        plusMenuElement={<ActionIcon icon="add" />}
        minusMenuElement={<ActionIcon icon="subtract" />}
        inputElement={(_, __, ___, key) =>
          key ? <Input onFocus={selectValue} onBlur={dispatchEnterKey} /> : <Input />
        }
      />
    </Wrapper>
  );
};
