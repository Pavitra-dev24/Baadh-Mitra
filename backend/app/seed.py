"""Seeds two demo districts with realistic-looking household rosters so the
app is immediately explorable after first deploy. Run with:
    python -m app.seed
Safe to re-run: it skips seeding if districts already exist.
"""

from app.database import Base, SessionLocal, engine
from app.models import District, ElevationBand, Household

DEMO_DISTRICTS = [
    {
        "name": "Ghongha Char, Ward 4",
        "river": "Ghongha River",
        "state": "Assam",
        "households": [
            ("Meena Devi", "near Shiv Mandir, behind the haat", ElevationBand.riverbank, True, False, True, 1),
            ("Ramesh Kumar", "opposite the PDS ration shop", ElevationBand.low_lying, False, True, False, 5),
            ("Sita & Halim Ansari", "next to the primary school", ElevationBand.mid_slope, False, True, False, 4),
            ("Bimal Das", "3rd house past the bamboo bridge", ElevationBand.riverbank, False, False, False, 3),
            ("Anwara Khatun", "behind the community health centre", ElevationBand.low_lying, True, False, True, 2),
            ("Suresh Mandal", "near the old banyan tree", ElevationBand.high_ground, False, True, False, 6),
            ("Fatima Bibi", "opposite the milk cooperative", ElevationBand.low_lying, False, False, False, 4),
            ("Nabin Chandra Roy", "behind the panchayat office", ElevationBand.mid_slope, True, True, False, 2),
        ],
    },
    {
        "name": "Kharun Basti, Ward 2",
        "river": "Kharun River",
        "state": "Chhattisgarh",
        "households": [
            ("Radha Bai", "near the water tank", ElevationBand.low_lying, True, False, False, 1),
            ("Deepak Sahu", "behind the anganwadi centre", ElevationBand.riverbank, False, True, False, 4),
            ("Kamla & Suraj Yadav", "opposite the grain mill", ElevationBand.mid_slope, False, True, False, 5),
            ("Manoj Verma", "3rd lane from the temple crossing", ElevationBand.high_ground, False, True, False, 3),
            ("Sunita Devi", "near the old well", ElevationBand.riverbank, True, False, True, 2),
        ],
    },
]


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(District).count() > 0:
            print("Districts already exist - skipping seed.")
            return

        for entry in DEMO_DISTRICTS:
            district = District(name=entry["name"], river=entry["river"], state=entry["state"])
            db.add(district)
            db.flush()  # get district.id before adding households

            for head_name, landmark, elevation, elderly, smartphone, mobility, size in entry["households"]:
                db.add(
                    Household(
                        district_id=district.id,
                        head_name=head_name,
                        landmark_chain=landmark,
                        elevation_band=elevation,
                        elderly_only=elderly,
                        has_smartphone=smartphone,
                        mobility_limited=mobility,
                        resident_count=size,
                    )
                )
        db.commit()
        print("Seeded demo districts and households.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
