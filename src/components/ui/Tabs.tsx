import styles from './Tabs.module.css';

interface TabItem<T extends string> {
  value: T;
  label: string;
}

interface TabsProps<T extends string> {
  value: T;
  items: Array<TabItem<T>>;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

export default function Tabs<T extends string>({ value, items, onChange, ariaLabel, className }: TabsProps<T>) {
  const classes = [styles.tabs, className ?? ''].filter(Boolean).join(' ');

  return (
    <div className={classes} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={[styles.tab, active ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
