import classNames from "classnames";
import {
	FC,
	ReactNode,
	useRef,
	useEffect,
	useState,
	useCallback,
	ReactElement
} from "react";
import style from "./SideBarLayout.module.css";
import { is } from "@electron-toolkit/utils";

type SideBarLayoutProps = {
	children: ReactElement<SideBarLayoutItemProps> | ReactElement<SideBarLayoutItemProps>[];
	className?: string;
};

type SideBarLayoutItemType = 'right-sidebar' | 'left-sidebar' | 'content';


export const SideBarLayout: FC<SideBarLayoutProps> = ({ children, className }) => {

	return (
		<div className={classNames(style.layout, className)}>
			{children}
		</div>
	);
}


type SideBarLayoutItemProps = {
	children: ReactNode;
	className?: string;
	contentType?: SideBarLayoutItemType;
	isClosed: boolean;
};

export const SideBarLayoutItem: FC<SideBarLayoutItemProps> = ({
	children,
	className,
	contentType,
	isClosed
}) => {

	const sidebarRef = useRef<HTMLDivElement>(null);
	const [isResizing, setIsResizing] = useState<boolean>(false);
	const [sidebarWidth, setSidebarWidth] = useState<number>(200);
	
	const closedWidth = 200;
	const openWidth = 40;
	const maxWidth = 400;
	
	const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
		setIsResizing(true);
	}, []);

	const stopResizing = useCallback(() => {
		setIsResizing(false);
	}, []);

	const resize = useCallback(
		(mouseMoveEvent: MouseEvent) => {
			if (isResizing && sidebarRef.current && contentType) {
				var tmpSidebarWidth: number = 0;
				if (contentType === 'left-sidebar') {
					tmpSidebarWidth = mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left
				} else {
					tmpSidebarWidth = (mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().right) * -1
				}								
				
				console.log('tmpSidebarWidth', tmpSidebarWidth);

				if (tmpSidebarWidth > openWidth) {
					tmpSidebarWidth = Math.max(tmpSidebarWidth, closedWidth);
				} else if (tmpSidebarWidth < closedWidth) {
					tmpSidebarWidth = 0;					
				} 
				



				if (tmpSidebarWidth > maxWidth) {
					tmpSidebarWidth = maxWidth;
				}			
				
				setSidebarWidth(
					tmpSidebarWidth
				);

			}
		},
		[isResizing]
	);


	useEffect(() => {		
		window.addEventListener("mousemove", resize);
		window.addEventListener("mouseup", stopResizing);
		return () => {
			window.removeEventListener("mousemove", resize);
			window.removeEventListener("mouseup", stopResizing);
		};
	}, [resize, stopResizing, isClosed]);


	if (contentType === 'right-sidebar') {
		return (
			<div className={classNames(style.right, style.sidebar, className)} ref={sidebarRef} style={{ width: sidebarWidth }} onMouseDown={(e) => e.preventDefault()}>
				<div className={style.resizer} onMouseDown={startResizing}>
					<div className={style.resizerBar} />
				</div>
				<div className={classNames(style.inner, (sidebarWidth < closedWidth ? style.closed : style.open))}>
					{children}
				</div>
			</div>
		);
	} else if (contentType === 'left-sidebar') {
		return (
			<div className={classNames(style.left, style.sidebar, className)} ref={sidebarRef} style={{ width: sidebarWidth }} onMouseDown={(e) => e.preventDefault()}>
				<div className={classNames(style.inner, (sidebarWidth < closedWidth ? style.closed : style.open))}>
					{children}
				</div>
				<div className={style.resizer} onMouseDown={startResizing}>
				<div className={style.resizerBar} />				
				</div>
			</div>
		);
	} else if (contentType === 'content') {
		return (
			<div className={classNames(style.content, className)}>
				{children}
			</div>
		);
	}
};
