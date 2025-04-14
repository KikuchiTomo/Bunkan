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

import styles from "./TitleBar.module.css";
import "@fontsource-variable/roboto-mono/wght.css";
import "@fontsource/fira-code/400.css";

type TitleBarProps = {
	title: string;
}

export const TitleBar: FC<TitleBarProps> = ({ title }) => {
	  return (
		<div className={classNames(styles.titleBar)}>		
			<div className={styles.buttonGroup}>		
			</div>	  
			<input className={styles.title} placeholder={title} />
	  		<div className={styles.buttonGroup}>		
	  		</div>
		</div>
  );
}
