import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PageOne from './PageOne';

const mockFetch = vi.fn();

function makeResponse(body, ok = true) {
  return Promise.resolve({
    ok,
    json: async () => body,
  });
}

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:3001');
  vi.stubGlobal('fetch', mockFetch);
  vi.stubGlobal('confirm', vi.fn(() => true));
});

afterEach(() => {
  mockFetch.mockReset();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('PageOne – Event-CRUD und Validierung', () => {
  it('T1 – erstellt ein neues Event und zeigt es in der Übersicht an', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockImplementationOnce(() => makeResponse({ events: [] }))
      .mockImplementationOnce(() => makeResponse({ id: '1', title: 'Open Air', date: '2026-08-20', description: 'Sommer', location: 'Bern' }));

    render(<PageOne onNavigate={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('Bevorstehende Events (0)')).toBeInTheDocument());

    const dateInput = document.querySelector('section.add-event-section input[type="date"]');

    await user.type(screen.getByPlaceholderText('Event Titel'), 'Open Air');
    await user.type(screen.getByPlaceholderText('Beschreibung'), 'Sommer');
    await user.type(dateInput, '2026-08-20');
    await user.type(screen.getByPlaceholderText('Ort'), 'Bern');
    await user.click(screen.getByRole('button', { name: /hinzufügen/i }));

    await waitFor(() => expect(screen.getByText('Open Air')).toBeInTheDocument());
    expect(screen.getByText('Bevorstehende Events (1)')).toBeInTheDocument();
  });

  it('T2 – zeigt eine Validierungsfehlermeldung bei fehlenden Pflichtfeldern', async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementationOnce(() => makeResponse({ events: [] }));

    render(<PageOne onNavigate={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('Bevorstehende Events (0)')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /hinzufügen/i }));

    expect(screen.getByText(/Titel und Datum sind erforderlich/i)).toBeInTheDocument();
  });

  it('T3 – bearbeitet ein vorhandenes Event', async () => {
    const user = userEvent.setup();
    const existingEvent = { id: '1', title: 'Alt', date: '2026-09-01', description: 'Alt Beschreibung', location: 'Zürich' };

    mockFetch
      .mockImplementationOnce(() => makeResponse({ events: [existingEvent] }))
      .mockImplementationOnce(() => makeResponse({ ...existingEvent, title: 'Neu' }));

    render(<PageOne onNavigate={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('Alt')).toBeInTheDocument());

    await user.click(screen.getAllByRole('button', { name: /bearbeiten/i })[0]);
    const editSection = screen.getByText('Event bearbeiten').closest('section');
    const titleInput = within(editSection).getByPlaceholderText('Event Titel');
    await user.clear(titleInput);
    await user.type(titleInput, 'Neu');
    await user.click(screen.getByRole('button', { name: /^speichern$/i }));

    await waitFor(() => expect(screen.getByText('Neu')).toBeInTheDocument());
  });

  it('T4 – löscht ein Event nach Bestätigung', async () => {
    const user = userEvent.setup();
    const existingEvent = { id: '1', title: 'Zu löschen', date: '2026-09-10', description: 'Test', location: 'Lugano' };

    mockFetch
      .mockImplementationOnce(() => makeResponse({ events: [existingEvent] }))
      .mockImplementationOnce(() => makeResponse({}));

    render(<PageOne onNavigate={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('Zu löschen')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /löschen/i }));

    await waitFor(() => expect(screen.queryByText('Zu löschen')).not.toBeInTheDocument());
  });

  it('T5 – zeigt eine Fehlermeldung, wenn die API nicht erreichbar ist', async () => {
    mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Daten konnten nicht geladen werden')));

    render(<PageOne onNavigate={vi.fn()} />);

    await waitFor(() => expect(screen.getByText(/Daten konnten nicht geladen werden/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });
});
