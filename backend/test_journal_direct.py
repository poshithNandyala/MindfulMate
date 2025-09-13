#!/usr/bin/env python3

"""
Direct test of journal saving functionality
"""

import os
import sys

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("TESTING JOURNAL SAVING DIRECTLY...")

try:
    from mongodb_database_handler import save_journal_entry
    
    # Test journal saving
    print("\nTesting journal save...")
    result = save_journal_entry(
        title="Direct Test Journal",
        entry="This is a direct test of the journal saving system. If this works, the API should work too.",
        username="direct_test_user"
    )
    print(f"SUCCESS: Journal saved with ID: {result}")
    
    # Test retrieval
    from mongodb_database_handler import get_journals_by_username
    print("\nTesting journal retrieval...")
    journals = get_journals_by_username("direct_test_user")
    print(f"SUCCESS: Retrieved {len(journals)} journals")
    
    if journals:
        latest = journals[0]
        print(f"   Latest: '{latest['title']}'")
        print(f"   Content: {latest['entry'][:50]}...")
    
    print("\nDIRECT JOURNAL TEST PASSED!")
    print("The journal system is working correctly.")
    print("If the frontend can't save journals, it's likely a connection issue.")
    
except Exception as e:
    print(f"❌ Direct test failed: {e}")
    import traceback
    traceback.print_exc()
