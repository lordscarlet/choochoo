import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { alpha, Button, Menu, MenuItem, MenuProps, styled } from "@mui/material";
import { useState } from "react";




const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
    ...theme.applyStyles('dark', {
      color: theme.palette.grey[300],
    }),
  },
}));

interface DropdownMenuProps<T> {
  title: string;
  options: T[];
  toString(t: T): string;
  onClick(t: T): void;
  disabled?: boolean;
}

export function DropdownMenu<T>({ options, title, disabled, onClick, toString }: DropdownMenuProps<T>) {
  const [anchorEl, setAnchorEl] = useState<undefined | HTMLElement>(undefined);
  const open = anchorEl != null;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(undefined);
  };

  return <>
    <Button
      id="demo-customized-button"
      aria-controls={open ? 'demo-customized-menu' : undefined}
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
      variant="contained"
      disableElevation
      onClick={handleClick}
      endIcon={<KeyboardArrowDownIcon />}
    >
      {title}
    </Button>
    <StyledMenu
      id="demo-customized-menu"
      MenuListProps={{
        'aria-labelledby': 'demo-customized-button',
      }}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
    >
      {options.map(option => <MenuItem key={toString(option)} onClick={() => { onClick(option); handleClose(); }} disabled={disabled}>{toString(option)}</MenuItem>)}
    </StyledMenu>
  </>;
}