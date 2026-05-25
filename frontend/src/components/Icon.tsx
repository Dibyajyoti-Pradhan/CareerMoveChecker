import { SVGProps } from 'react';

type Name =
  | 'search' | 'arrow-right' | 'check' | 'x' | 'plus' | 'minus' | 'refresh'
  | 'shield' | 'bell' | 'eye' | 'eye-off' | 'lock' | 'mail' | 'edit'
  | 'download' | 'upload' | 'external' | 'chevron-down' | 'chevron-right'
  | 'star' | 'flag' | 'building' | 'user' | 'users' | 'home' | 'list'
  | 'compare' | 'settings' | 'logout' | 'github' | 'google' | 'info'
  | 'warn' | 'alert' | 'menu' | 'sparkle' | 'print' | 'trash' | 'copy';

interface Props extends SVGProps<SVGSVGElement> {
  name: Name;
  size?: number;
}

const paths: Record<Name, string> = {
  search:        'M11 11l4 4M7 12a5 5 0 100-10 5 5 0 000 10z',
  'arrow-right': 'M3 8h10M8 3l5 5-5 5',
  check:         'M3 8l3 3 7-7',
  x:             'M4 4l8 8M12 4l-8 8',
  plus:          'M8 3v10M3 8h10',
  minus:         'M3 8h10',
  refresh:       'M3 8a5 5 0 018-3.5M13 8a5 5 0 01-8 3.5M11 1v3.5h3.5M5 15v-3.5H1.5',
  shield:        'M8 1.5l5 2v4c0 3-2.2 5.5-5 6.5-2.8-1-5-3.5-5-6.5v-4l5-2z',
  bell:          'M8 1.5a4 4 0 014 4v2.5l1 1v1.5H3v-1.5l1-1V5.5a4 4 0 014-4zM6.5 13a1.5 1.5 0 003 0',
  eye:           'M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8zM8 10a2 2 0 100-4 2 2 0 000 4z',
  'eye-off':     'M2 2l12 12M6.5 6.5a2 2 0 002.8 2.8M3 3.5C1.8 4.7 1 8 1 8s2.5 4.5 7 4.5c1.3 0 2.4-.3 3.4-.8M13.5 11.5C14.5 10.4 15 8 15 8s-2.5-4.5-7-4.5c-.7 0-1.4.1-2 .3',
  lock:          'M4 7V5a4 4 0 018 0v2M3 7h10v7H3z',
  mail:          'M1.5 4.5h13v7h-13zM1.5 4.5l6.5 4.5 6.5-4.5',
  edit:          'M2 12v2h2l7-7-2-2-7 7zM10 3l2 2',
  download:      'M8 1.5v9M4 7l4 4 4-4M2 13.5h12',
  upload:        'M8 11.5v-9M4 6l4-4 4 4M2 13.5h12',
  external:      'M5 3h-2.5v10h10v-2.5M9 2.5h4v4M13 2.5l-6 6',
  'chevron-down':  'M3 5.5l5 5 5-5',
  'chevron-right': 'M5.5 3l5 5-5 5',
  star:          'M8 2l1.8 4 4.2.6-3 2.9.7 4.2L8 11.7l-3.7 2L5 9.5 2 6.6 6.2 6z',
  flag:          'M3 14V2M3 3h9l-2 3 2 3H3',
  building:      'M3 14V3h10v11M5.5 6h2M5.5 9h2M5.5 12h2M9 6h2M9 9h2M9 12h2',
  user:          'M8 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3 14c0-2.5 2.2-4 5-4s5 1.5 5 4',
  users:         'M6 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1 14c0-2.5 2-4 5-4s5 1.5 5 4M11 4a2 2 0 110 4M15 13c0-2-1.5-3.5-3.5-3.5',
  home:          'M2 7l6-5 6 5v7H2z M6 14v-4h4v4',
  list:          'M5 4h9M5 8h9M5 12h9M2 4v.01M2 8v.01M2 12v.01',
  compare:       'M3 2h4v12H3zM9 2h4v12H9z',
  settings:      'M8 11a3 3 0 100-6 3 3 0 000 6zM8 1v2M8 13v2M3 8H1M15 8h-2M3.5 3.5l1.5 1.5M11 11l1.5 1.5M3.5 12.5L5 11M11 5l1.5-1.5',
  logout:        'M9 11v1.5H3.5v-9H9V5M7 8h7M11 5l3 3-3 3',
  github:        'M8 1.5C4.4 1.5 1.5 4.4 1.5 8c0 2.9 1.9 5.3 4.4 6.2.3.1.4-.1.4-.3v-1.2c-1.8.4-2.2-.9-2.2-.9-.3-.7-.7-.9-.7-.9-.6-.4 0-.4 0-.4.6 0 1 .7 1 .7.6 1 1.5.7 1.9.6.1-.4.2-.7.4-.9-1.4-.2-2.9-.7-2.9-3.2 0-.7.3-1.3.7-1.7-.1-.2-.3-.9.1-1.8 0 0 .6-.2 1.8.7.5-.1 1.1-.2 1.6-.2.6 0 1.1.1 1.6.2 1.2-.8 1.8-.7 1.8-.7.4.9.1 1.6.1 1.8.4.5.7 1 .7 1.7 0 2.5-1.5 3-2.9 3.2.2.2.4.6.4 1.2v1.8c0 .2.1.4.4.3 2.6-.9 4.4-3.3 4.4-6.2 0-3.6-2.9-6.5-6.5-6.5z',
  google:        'M14.5 8.2c0-.5 0-.9-.1-1.4H8v2.7h3.6c-.2.8-.6 1.5-1.4 2v1.6h2.2c1.3-1.2 2.1-3 2.1-4.9zM8 15c1.9 0 3.5-.6 4.7-1.7l-2.2-1.7c-.6.4-1.5.7-2.5.7-1.9 0-3.5-1.3-4.1-3H1.6V11C2.9 13.4 5.3 15 8 15zM3.9 9.2c-.2-.4-.2-.8-.2-1.2s.1-.8.2-1.2V5.1H1.6C1.2 5.9 1 6.9 1 8s.2 2.1.6 2.9l2.3-1.7zM8 3.6c1.1 0 2 .4 2.8 1.1l2-2C11.5 1.6 9.9 1 8 1 5.3 1 2.9 2.6 1.6 5l2.3 1.7C4.5 4.9 6.1 3.6 8 3.6z',
  info:          'M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM8 7v4.5M8 5v.01',
  warn:          'M8 1.5l6.5 12h-13L8 1.5zM8 6v4M8 12v.01',
  alert:         'M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM8 5v4M8 11v.01',
  menu:          'M2 4h12M2 8h12M2 12h12',
  sparkle:       'M8 1.5l1.5 4.5L14 7.5l-4.5 1.5L8 13.5 6.5 9 2 7.5l4.5-1.5L8 1.5z',
  print:         'M4 5V2h8v3M4 11H2V6h12v5h-2M5 9h6v5H5z',
  trash:         'M3 4h10M5.5 4V2.5h5V4M5 4l.5 9h5L11 4',
  copy:          'M5 5V3a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-2M3 6h6a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1z',
};

export function Icon({ name, size = 16, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className="ico"
      aria-hidden="true"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}
