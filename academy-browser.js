const assignableRoles = new Set(['student', 'teacher']);

function requireThat(condition, code) {
  if (!condition) throw new Error(code);
}

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

class Academy {
  #accounts = new Map();
  #campuses = new Map();

  addAccount(id, role = 'member') {
    requireThat(nonempty(id) && !this.#accounts.has(id), 'invalid_account');
    requireThat(role === 'member' || role === 'platform-admin', 'invalid_role');
    this.#accounts.set(id, { role, reflections: [] });
  }

  requestCampus(actor, name) {
    this.#account(actor);
    requireThat(nonempty(name), 'invalid_name');
    const id = globalThis.crypto.randomUUID();
    this.#campuses.set(id, {
      name: name.trim(),
      applicant: actor,
      state: 'pending',
      members: new Map(),
    });
    return id;
  }

  approveCampus(actor, id, seats) {
    requireThat(this.#account(actor).role === 'platform-admin', 'forbidden');
    const campus = this.#campuses.get(id);
    requireThat(campus?.state === 'pending', 'invalid_state');
    requireThat(Number.isSafeInteger(seats) && seats > 0, 'invalid_seat_limit');
    campus.seats = seats;
    campus.members.set(campus.applicant, 'campus-admin');
    campus.state = 'active';
  }

  viewCampus(actor, id) {
    const { campus, role } = this.#campusMembership(actor, id);
    return { id, name: campus.name, role };
  }

  addMember(actor, id, accountId, role) {
    const campus = this.#adminCampus(actor, id);
    this.#account(accountId);
    requireThat(assignableRoles.has(role), 'invalid_role');
    requireThat(!campus.members.has(accountId), 'already_member');
    requireThat(campus.members.size < campus.seats, 'seat_limit');
    campus.members.set(accountId, role);
  }

  removeMember(actor, id, accountId) {
    const campus = this.#adminCampus(actor, id);
    requireThat(campus.members.has(accountId) && accountId !== actor, 'invalid_member');
    campus.members.delete(accountId);
  }

  recordPassportReflection(actor, reflection) {
    const account = this.#account(actor);
    requireThat(nonempty(reflection), 'invalid_reflection');
    account.reflections.push(reflection.trim());
  }

  viewPassport(actor) {
    return [...this.#account(actor).reflections];
  }

  #account(id) {
    const account = this.#accounts.get(id);
    requireThat(account, 'forbidden');
    return account;
  }

  #campusMembership(actor, id) {
    const campus = this.#campuses.get(id);
    const role = campus?.members.get(actor);
    requireThat(campus?.state === 'active' && role, 'forbidden');
    return { campus, role };
  }

  #adminCampus(actor, id) {
    const { campus, role } = this.#campusMembership(actor, id);
    requireThat(role === 'campus-admin', 'forbidden');
    return campus;
  }
}

if (typeof module !== 'undefined') module.exports = Academy;
