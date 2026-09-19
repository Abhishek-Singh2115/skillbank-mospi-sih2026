import asyncio

async def main():
    from backend.database import db_manager
    await db_manager.connect()
    col = db_manager.get_collection("users")

    # List ALL user documents currently stored
    cursor = col.find({})
    docs = await cursor.to_list(length=50)
    if not docs:
        print("No users found in the database yet.")
        print("Sign in via the app first, then re-run this script.")
    else:
        print(f"Found {len(docs)} user(s):")
        for d in docs:
            print(f"  _id={d.get(chr(95)+chr(105)+chr(100))}  email={d.get(chr(101)+chr(109)+chr(97)+chr(105)+chr(108))}  role={d.get(chr(114)+chr(111)+chr(108)+chr(101), chr(110)+chr(111)+chr(110)+chr(101))}")

asyncio.run(main())
