import { DataSource } from 'typeorm';
import { MatchGroup, MatchParticipant, MatchStatus } from '../entities/match.entity';
import { Child } from '../entities/child.entity';

export async function seedMatches(dataSource: DataSource, children: Child[]): Promise<void> {
    const matchGroupRepository = dataSource.getRepository(MatchGroup);

    // We will hardcode a few match scenarios to act as "demo" data.
    // This assumes we have enough children seeded. We used ~18 children.

    // SCENARIO 1: Simple 2-way swap (Pending)
    // Child A (from KG 1) wants KG 2
    // Child B (from KG 2) wants KG 1

    // Let's pick 2 children arbitrarily that have different KGs
    if (children.length < 4) {
        console.log("Not enough children to seed matches properly.");
        return;
    }

    const child1 = children[0];
    const child2 = children[1];

    // Ensure they are different and have KGs
    if (child1.id !== child2.id && child1.current_kindergarten && child2.current_kindergarten) {
        // Create match group
        const group1 = new MatchGroup();
        group1.status = MatchStatus.PENDING_ACCEPTANCE;

        const p1 = new MatchParticipant();
        p1.match_group = group1;
        p1.child = child1;
        p1.next_child = child2; // Child 1 moves to Child 2's spot
        p1.has_accepted = true; // One accepted

        const p2 = new MatchParticipant();
        p2.match_group = group1;
        p2.child = child2;
        p2.next_child = child1; // Child 2 moves to Child 1's spot
        p2.has_accepted = false; // Still pending

        group1.participants = [p1, p2];
        await matchGroupRepository.save(group1);

        // Save participants via cascade or manually if needed, 
        // but TypeORM usually handles cascade if configured. 
        // Entity def for MatchGroup has @OneToMany(..., { cascade: true }) ?
        // Checking entity definition from context... 
        // MatchGroup has: @OneToMany(() => MatchParticipant, (participant) => participant.match_group)
        // It does NOT have cascade: true explicitly shown in the view_file output.
        // So we likely need to save participants manually or update entity to cascade.
        // Let's save manually to be safe for now, as I can't edit entity easily without checking.

        // Wait, I need to save group first to get ID if I save participants manually? 
        // TypeORM can insert graph if relation is set up right.
        // Let's try saving participants.

        // Actually, without cascade: ['insert'], saving group won't save participants.
        // Let's modify the entities to include cascade or save manually.
        // I'll save manually.

        const participantRepo = dataSource.getRepository(MatchParticipant);
        await participantRepo.save([p1, p2]);
        console.log("Seeded Scenario 1: Pending Match");
    }

    // SCENARIO 2: Active Contact (Accepted)
    const child3 = children[2];
    const child4 = children[3];

    if (child3.current_kindergarten && child4.current_kindergarten) {
        const group2 = new MatchGroup();
        group2.status = MatchStatus.ACTIVE_CONTACT;
        await matchGroupRepository.save(group2);

        const p3 = new MatchParticipant();
        p3.match_group = group2;
        p3.child = child3;
        p3.next_child = child4;
        p3.has_accepted = true;

        const p4 = new MatchParticipant();
        p4.match_group = group2;
        p4.child = child4;
        p4.next_child = child3;
        p4.has_accepted = true;

        const participantRepo = dataSource.getRepository(MatchParticipant);
        await participantRepo.save([p3, p4]);
        console.log("Seeded Scenario 2: Active Contact Match");
    }

    console.log("Match seeding completed.");
}
