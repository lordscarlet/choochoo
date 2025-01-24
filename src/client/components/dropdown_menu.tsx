import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  alpha,
  Button,
  IconButton,
  Menu,
  MenuItem,
  MenuItemProps,
  MenuItemTypeMap,
  MenuProps,
  styled,
} from "@mui/material";
import {
  createContext,
  MouseEvent,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: "rgb(55, 65, 81)",
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
    ...theme.applyStyles("dark", {
      color: theme.palette.grey[300],
    }),
  },
}));

interface BaseDropdownMenuProps {
  id: string;
  disabled?: boolean;
  ariaLabel?: string;
  children: ReactNode;
}

interface TitleDropdownMenuProps extends BaseDropdownMenuProps {
  title: string;
}

interface IconDropdownMenuProps extends BaseDropdownMenuProps {
  icon: ReactNode;
}

type DropdownMenuProps = TitleDropdownMenuProps | IconDropdownMenuProps;

const DropdownCloser = createContext<(() => void) | undefined>(undefined);

export function DropdownMenu({
  id,
  ariaLabel,
  disabled,
  children,
  ...rest
}: DropdownMenuProps) {
  const [anchorEl, setAnchorEl] = useState<undefined | HTMLElement>(undefined);
  const open = anchorEl != null;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const menuId = id + "-menu";
  const buttonId = id + "-button";

  return (
    <DropdownCloser.Provider value={handleClose}>
      {"title" in rest && (
        <Button
          id={buttonId}
          aria-controls={open ? menuId : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          variant="contained"
          disableElevation
          onClick={handleClick}
          aria-label={ariaLabel}
          endIcon={<KeyboardArrowDownIcon />}
          disabled={disabled}
        >
          {rest.title}
        </Button>
      )}
      {"icon" in rest && (
        <IconButton
          size="large"
          aria-label={ariaLabel}
          aria-controls={open ? menuId : undefined}
          aria-haspopup="true"
          onClick={handleClick}
          color="inherit"
        >
          {rest.icon}
        </IconButton>
      )}
      <StyledMenu
        id={menuId}
        MenuListProps={{
          "aria-labelledby": buttonId,
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {children}
      </StyledMenu>
    </DropdownCloser.Provider>
  );
}

export function DropdownMenuItem<
  T extends React.ElementType = MenuItemTypeMap["defaultComponent"],
  R = object,
>({
  onClick,
  ...rest
}: MenuItemProps<T, R> & { onClick?: (e: MouseEvent<HTMLLIElement>) => void }) {
  const dropdownCloser = useContext(DropdownCloser);
  const internalOnClick = useCallback(
    (e: MouseEvent<HTMLLIElement>) => {
      dropdownCloser?.();
      onClick?.(e);
    },
    [onClick],
  );
  return <MenuItem onClick={internalOnClick} {...rest} />;
}
