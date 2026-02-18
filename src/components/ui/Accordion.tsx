import { ChevronDown } from 'lucide-react';
import styles from './Accordion.module.css';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
  openId: string | null;
  onToggle: (id: string) => void;
}

export default function Accordion({ items, openId, onToggle }: AccordionProps) {
  return (
    <div className={styles.accordion}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <article key={item.id} className={[styles.item, isOpen ? styles.itemOpen : ''].filter(Boolean).join(' ')}>
            <button type="button" className={styles.trigger} onClick={() => onToggle(item.id)} aria-expanded={isOpen}>
              <span>{item.title}</span>
              <ChevronDown className={[styles.icon, isOpen ? styles.openIcon : ''].filter(Boolean).join(' ')} />
            </button>
            {isOpen ? <div className={styles.content}>{item.content}</div> : null}
          </article>
        );
      })}
    </div>
  );
}
