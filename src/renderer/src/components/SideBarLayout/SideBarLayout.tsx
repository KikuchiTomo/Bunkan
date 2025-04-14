import classNames from "classnames";
import {
  createContext,
  FC,
  ReactNode,
  useMemo,
  useState,
  useContext,
  ReactElement,
  JSX,
} from "react";
import style from "./SideBarLayout.module.css";
import { is } from "@electron-toolkit/utils";

type SideBarLayoutProps = {
	children: ReactElement<SideBarLayoutItemProps> | ReactElement<SideBarLayoutItemProps>[];
	className?: string;
};

type SideBarLayoutItemType = 'right-sidebar' | 'left-sidebar' | 'content';

type SideBarLayoutContextState = {  
	isClosed: boolean;  
	setIsClosed: (isClosed: boolean) => void;
};

const SideBarItemContext = createContext<SideBarLayoutContextState>({ 
	isClosed: false,  
	setIsClosed: () => {},
});

export const SideBarLayout: FC<SideBarLayoutProps> = ({ children, className }) => {
	
	return (
		<div className={classNames(style.layout, className)}>			
			 <SideBarItemContext.Provider
				value={{					
					isClosed: false,	
					setIsClosed: (isClosed: boolean) => {
						// setIsClosed(isClosed);
					},
				}}
			>
				{children}
			</SideBarItemContext.Provider> 
		</div>
	);
}


type SideBarLayoutItemProps = {
	children: ReactNode;
	className?: string;	
	contentType?: SideBarLayoutItemType;
};

export const SideBarLayoutItem: FC<SideBarLayoutItemProps> = ({
	children,
	className,
	contentType
}) => {
	const { isClosed, setIsClosed } = useContext(SideBarItemContext);

	if (isClosed === true || isClosed === undefined) {
		return null;
	}

	if ( contentType === 'right-sidebar') {
		return (
			<div className={classNames(style.right, style.sidebar, className, (isClosed ? style.closed : style.open))}>
				{children}
			</div>
		);
	}else if (contentType === 'left-sidebar') {
		return (
			<div className={classNames(style.left, style.sidebar, className, (isClosed ? style.closed : style.open))}>
				{children}
			</div>
		);
	}else if (contentType === 'content') {
		return (
			<div className={classNames(style.content, className)}>
				{children}
			</div>
		);
	}
};
